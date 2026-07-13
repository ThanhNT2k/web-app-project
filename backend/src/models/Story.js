const db = require('../config/database');
const Tag = require('./Tag');

function followStatsCte() {
  return `
    WITH follow_stats AS (
      SELECT
        story_id,
        COUNT(*)::int AS follow_count
      FROM user_follows
      GROUP BY story_id
    )
  `;
}

/**
 * Hàm utility: Gán tags vào từng story trong danh sách (batch fetch).
 * Thay vì gọi getTagsForStory() cho từng story (N+1 queries),
 * hàm này fetch tất cả tags của N stories chỉ trong 1 query duy nhất,
 * sau đó map vào từng story bằng dictionary lookup.
 *
 * @param {Array} stories - Danh sách story objects
 * @returns {Array} Danh sách story với trường tags đính kèm
 */
async function attachTagsToStories(stories) {
  if (!stories.length) return stories;

  // Lấy mảng IDs của tất cả stories cần lấy tag
  const ids = stories.map((s) => s.id);

  // Query một lần lấy tất cả tags của tất cả stories
  // ANY($1::int[]): Tương đương với WHERE story_id IN (...) nhưng an toàn hơn với parameterized query
  const result = await db.query(
    `
      SELECT st.story_id, t.id, t.name, t.slug
      FROM story_tags st
      INNER JOIN tags t ON t.id = st.tag_id
      WHERE st.story_id = ANY($1::int[])
      ORDER BY t.name ASC
    `,
    [ids]
  );

  // Xây dựng dictionary: { story_id: [tag1, tag2, ...] }
  // Giúp tra cứu tags theo story_id trong O(1) thay vì O(n)
  const map = {};
  for (const row of result.rows) {
    if (!map[row.story_id]) map[row.story_id] = [];
    map[row.story_id].push({ id: row.id, name: row.name, slug: row.slug });
  }

  // Merge tags vào từng story object, story không có tag nào thì gán mảng rỗng
  return stories.map((s) => ({ ...s, tags: map[s.id] || [] }));
}

/**
 * Lấy danh sách tất cả truyện với pagination, sắp xếp và optional filter unpublished.
 *
 * Hỗ trợ 3 chế độ sắp xếp (sortBy):
 * - 'newest': Sắp xếp theo created_at DESC (mặc định)
 * - 'popular': Sắp xếp theo số lượng follows DESC (cần LEFT JOIN với user_follows)
 * - 'updated': Sắp xếp theo updated_at DESC (cập nhật gần nhất)
 *
 * COUNT(*) OVER(): Window function để đếm tổng số record mà không cần query riêng
 * → Trả về cả data và total_count trong 1 query duy nhất (hiệu quả hơn 2 queries)
 */
async function getAllStories(page = 1, limit = 10, sortBy = 'newest', includeUnpublished = false) {
  // Đảm bảo page và limit là số nguyên dương hợp lệ
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
  const offset = (safePage - 1) * safeLimit;

  let orderBy = 's.created_at DESC'; // Mặc định: mới nhất trước

  if (sortBy === 'popular') {
    orderBy = 'follow_count DESC, s.created_at DESC'; // Nhiều follow nhất trước, cùng follow thì mới nhất trước
  } else if (sortBy === 'updated') {
    orderBy = 's.updated_at DESC';  // Truyện có chapter mới nhất trước
  }

  try {
    const query = `
      ${followStatsCte()}
      SELECT
        s.id,
        s.title,
        s.slug,
        s.author_id,
        s.author_name,
        s.description,
        s.cover_image_url,
        s.category,
        s.status,
        s.total_chapters,
        s.total_views,
        s.created_at,
        s.updated_at,
        s.is_published,
        s.hidden_by_admin,
        COALESCE(s.total_rating_count, 0)::int AS rating_count,
        COALESCE(s.average_rating, 0)::float8 AS average_rating,
        COUNT(*) OVER() AS total_count,      -- Window function: tổng số record không bị ảnh hưởng bởi LIMIT/OFFSET
        u.username AS author_username,
        u.full_name AS author_full_name,
        COALESCE(fs.follow_count, 0)::int AS follow_count
      FROM stories s
      LEFT JOIN users u ON u.id = s.author_id
      LEFT JOIN follow_stats fs ON fs.story_id = s.id
      ${includeUnpublished ? '' : 'WHERE s.is_published = true'}  -- Admin xem được truyện chưa publish
      ORDER BY ${orderBy}
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(query, [safeLimit, offset]);

    // Đọc tổng số record từ cột total_count (window function trả về giá trị giống nhau cho mọi row)
    const totalItems = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

    // Loại bỏ cột total_count khỏi mỗi story object (chỉ dùng để tính pagination)
    const stories = result.rows.map(({ total_count, ...story }) => story);

    return {
      stories: await attachTagsToStories(stories),
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / safeLimit),
      },
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Lấy chi tiết một truyện theo ID.
 * Bao gồm thông tin tác giả và các thống kê đã đồng bộ trên bảng stories.
 * Sau đó fetch thêm tags và cộng tác viên bằng query riêng.
 */
async function getStoryById(id) {
  try {
    const result = await db.query(
      `
        SELECT
          s.id,
          s.title,
          s.slug,
          s.author_id,
          s.author_name,
          s.description,
          s.cover_image_url,
          s.category,
          s.status,
          s.total_chapters,
          s.total_views,
          s.created_at,
          s.updated_at,
          s.is_published,
          s.hidden_by_admin,
          s.moderation_status,
          s.moderation_note,
          s.reviewed_at,
          COALESCE(s.total_rating_count, 0)::int AS rating_count,
          COALESCE(s.average_rating, 0)::float8 AS average_rating,
          COALESCE(s.total_chapters, 0)::int AS chapter_count,
          (
            SELECT COUNT(*)::int
            FROM user_follows uf
            WHERE uf.story_id = s.id
          ) AS follow_count,
          u.id AS author_user_id,
          u.username AS author_username,
          u.full_name AS author_full_name,
          u.avatar_url AS author_avatar_url
        FROM stories s
        LEFT JOIN users u ON u.id = s.author_id
        WHERE s.id = $1
        LIMIT 1
      `,
      [id]
    );

    const story = result.rows[0] || null;
    if (!story) return null;

    // Fetch tags riêng vì không thể aggregate mảng tags trong cùng GROUP BY query
    const tags = await Tag.getTagsForStory(story.id);

    // Lấy danh sách cộng tác viên
    const collaboratorsResult = await db.query(
      `
        SELECT u.id, u.username, u.email, u.full_name, u.avatar_url, sc.created_at
        FROM story_collaborators sc
        INNER JOIN users u ON u.id = sc.user_id
        WHERE sc.story_id = $1
        ORDER BY sc.created_at ASC
      `,
      [story.id]
    );
    const collaborators = collaboratorsResult.rows;

    return { ...story, tags, collaborators };
  } catch (error) {
    throw error;
  }
}

/**
 * Tạo truyện mới trong database.
 * RETURNING: Trả về các trường của record vừa INSERT, tránh phải query lại.
 * Cover image và category cho phép null (truyện mới tạo có thể chưa có ảnh bìa).
 */
async function createStory(storyData) {
  const { title, slug, author_id, author_name, description, cover_image_url, category } = storyData;

  try {
    const result = await db.query(
      `
        INSERT INTO stories (
          title,
          slug,
          author_id,
          author_name,
          description,
          cover_image_url,
          category,
          is_published,
          moderation_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, false, 'pending')
        RETURNING
          id,
          title,
          slug,
          author_id,
          author_name,
          description,
          cover_image_url,
          category,
          status,
          total_chapters,
          created_at,
          updated_at,
          is_published,
          hidden_by_admin,
          moderation_status,
          moderation_note,
          reviewed_at
      `,
      [title, slug, author_id, author_name, description || null, cover_image_url || null, category || null]
    );

    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

/**
 * Cập nhật thông tin truyện (partial update).
 * COALESCE($n, field): Giữ nguyên giá trị cũ nếu giá trị mới là NULL.
 * Đây là cách thực hiện partial update trong SQL không cần dynamic query.
 */
async function updateStory(id, storyData) {
  const { title, author_name, description, cover_image_url, category, status } = storyData;

  try {
    const result = await db.query(
      `
        UPDATE stories
        SET
          title = COALESCE($1, title),
          author_name = COALESCE($2, author_name),
          description = COALESCE($3, description),
          cover_image_url = COALESCE($4, cover_image_url),
          category = COALESCE($5, category),
          status = COALESCE($6, status),
          moderation_status = CASE
            WHEN moderation_status IN ('changes_requested', 'rejected') THEN 'pending'
            ELSE moderation_status
          END,
          moderation_note = CASE
            WHEN moderation_status IN ('changes_requested', 'rejected') THEN NULL
            ELSE moderation_note
          END,
          reviewed_by = CASE
            WHEN moderation_status IN ('changes_requested', 'rejected') THEN NULL
            ELSE reviewed_by
          END,
          reviewed_at = CASE
            WHEN moderation_status IN ('changes_requested', 'rejected') THEN NULL
            ELSE reviewed_at
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING
          id,
          title,
          slug,
          author_id,
          author_name,
          description,
          cover_image_url,
          category,
          status,
          total_chapters,
          created_at,
          updated_at,
          is_published,
          hidden_by_admin,
          moderation_status,
          moderation_note,
          reviewed_at
      `,
      [title || null, author_name || null, description || null, cover_image_url || null, category || null, status || null, id]
    );

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Soft delete truyện: Đặt is_published = false thay vì DELETE thật.
 * Lý do dùng soft delete:
 * - Bảo toàn lịch sử đọc của user liên kết với truyện
 * - Bảo toàn bình luận, dữ liệu thống kê
 * - Admin có thể khôi phục lại truyện nếu xóa nhầm
 */
async function deleteStory(id) {
  try {
    const result = await db.query(
      `
        UPDATE stories
        SET is_published = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING
          id,
          title,
          slug,
          author_id,
          description,
          cover_image_url,
          category,
          status,
          total_chapters,
          created_at,
          updated_at,
          is_published,
          hidden_by_admin
      `,
      [id]
    );

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Tìm kiếm truyện với nhiều bộ lọc kết hợp.
 *
 * Cơ chế lọc:
 * - searchTerm: ILIKE tìm kiếm không phân biệt hoa/thường trong title VÀ description
 * - category: exact match với category field
 * - tagSlug: dùng EXISTS subquery để tìm truyện có tag với slug tương ứng
 *
 * Kỹ thuật $n::text IS NULL: Cho phép bỏ qua điều kiện lọc khi tham số không được cung cấp.
 * Ví dụ: ($1::text IS NULL OR s.title ILIKE $1) → Nếu $1 là null thì bỏ qua điều kiện tìm kiếm text
 */
async function searchStories(query, category = null, tag = null, page = 1, limit = 10) {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
  const offset = (safePage - 1) * safeLimit;
  const q = (query || '').trim();

  // Chuyển từ khóa tìm kiếm thành pattern LIKE với % ở 2 đầu
  // Nếu không có từ khóa, trả về null để bỏ qua điều kiện tìm kiếm text
  const searchTerm = q ? `%${q}%` : null;

  // Chuyển tag thành slug để tìm kiếm chính xác trong bảng tags
  const tagSlug = tag ? Tag.slugify(tag) : null;

  try {
    const result = await db.query(
      `
        ${followStatsCte()}
        SELECT
          s.id,
          s.title,
          s.slug,
          s.author_id,
          s.author_name,
          s.description,
          s.cover_image_url,
          s.category,
          s.status,
          s.total_chapters,
          s.total_views,
          s.created_at,
          s.updated_at,
          s.is_published,
          s.hidden_by_admin,
          COALESCE(s.total_rating_count, 0)::int AS rating_count,
          COALESCE(s.average_rating, 0)::float8 AS average_rating,
          COUNT(*) OVER() AS total_count,
          u.username AS author_username,
          u.full_name AS author_full_name,
          COALESCE(fs.follow_count, 0)::int AS follow_count
        FROM stories s
        LEFT JOIN users u ON u.id = s.author_id
        LEFT JOIN follow_stats fs ON fs.story_id = s.id
        WHERE s.is_published = true
          AND (
            $1::text IS NULL                -- Nếu không có từ khóa, bỏ qua điều kiện tìm kiếm
            OR s.title ILIKE $1             -- Tìm trong title (không phân biệt hoa/thường)
            OR s.author_name ILIKE $1       -- Tìm theo tên tác giả của tác phẩm
            OR s.description ILIKE $1       -- Tìm trong description
          )
          AND ($2::text IS NULL OR s.category = $2)   -- Lọc theo thể loại (exact match)
          AND (
            $3::text IS NULL                -- Nếu không có tag filter, bỏ qua điều kiện
            OR EXISTS (
              SELECT 1 FROM story_tags st
              INNER JOIN tags t ON t.id = st.tag_id
              WHERE st.story_id = s.id AND t.slug = $3   -- Tìm story có tag với slug tương ứng
            )
          )
        ORDER BY s.created_at DESC
        LIMIT $4 OFFSET $5
      `,
      [searchTerm, category, tagSlug, safeLimit, offset]
    );

    const totalItems = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
    const stories = result.rows.map(({ total_count, ...story }) => story);

    return {
      stories: await attachTagsToStories(stories),
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / safeLimit),
      },
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Lấy tất cả truyện của một tác giả cụ thể (kể cả unpublished).
 * Dùng ở trang dashboard của tác giả để quản lý tất cả truyện của mình.
 * Sắp xếp theo updated_at DESC để truyện cập nhật gần đây nhất hiển thị trước.
 */
async function getStoriesByAuthor(authorId, page = 1, limit = 20) {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.max(parseInt(limit, 10) || 20, 1);
  const offset = (safePage - 1) * safeLimit;

  const result = await db.query(
    `
      ${followStatsCte()}
      SELECT
        s.*,
        COALESCE(s.total_rating_count, 0)::int AS rating_count,
        COALESCE(s.average_rating, 0)::float8 AS average_rating,
        COUNT(*) OVER() AS total_count,
        u.username AS author_username,
        u.full_name AS author_full_name,
        COALESCE(fs.follow_count, 0)::int AS follow_count
      FROM stories s
      LEFT JOIN users u ON u.id = s.author_id
      LEFT JOIN follow_stats fs ON fs.story_id = s.id
      WHERE s.author_id = $1
         OR EXISTS (
           SELECT 1 
           FROM story_collaborators sc 
           WHERE sc.story_id = s.id AND sc.user_id = $1
         )
      ORDER BY s.updated_at DESC
      LIMIT $2 OFFSET $3
    `,
    [authorId, safeLimit, offset]
  );

  const totalItems = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

  return {
    stories: await attachTagsToStories(result.rows.map(({ total_count, ...story }) => story)),
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages: Math.ceil(totalItems / safeLimit),
    },
  };
}

/**
 * Toggle ẩn/hiện truyện.
 * - Admin có quyền ẩn tuyệt đối (set hidden_by_admin = true, is_published = false).
 * - Uploader chỉ ẩn/hiện thông thường và không được thay đổi nếu Admin đã ẩn.
 */
async function toggleVisibility(id, userRole) {
  try {
    const storyResult = await db.query(
      'SELECT is_published, hidden_by_admin, author_id FROM stories WHERE id = $1',
      [id]
    );
    const story = storyResult.rows[0];
    if (!story) return null;

    let nextPublished = !story.is_published;
    let nextHiddenByAdmin = story.hidden_by_admin;

    if (userRole === 'Admin') {
      if (story.is_published) {
        nextPublished = false;
        nextHiddenByAdmin = true;
      } else {
        nextPublished = true;
        nextHiddenByAdmin = false;
      }
    } else {
      if (story.hidden_by_admin) {
        throw new Error('Truyện này đã bị Admin ẩn. Bạn không có quyền hiện lại.');
      }
      nextHiddenByAdmin = false;
    }

    const result = await db.query(
      `
        UPDATE stories
        SET is_published = $1,
            hidden_by_admin = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING
          id,
          title,
          slug,
          author_id,
          description,
          cover_image_url,
          category,
          status,
          total_chapters,
          created_at,
          updated_at,
          is_published,
          hidden_by_admin
      `,
      [nextPublished, nextHiddenByAdmin, id]
    );

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Lấy chi tiết một truyện theo Slug.
 * Bao gồm thông tin tác giả và các thống kê đã đồng bộ trên bảng stories.
 */
async function getStoryBySlug(slug) {
  try {
    const match = slug.match(/^(\d+)(?:-(.*))?$/);
    let query, params;

    if (match) {
      const storyId = parseInt(match[1], 10);
      query = `
        SELECT
          s.id,
          s.title,
          s.slug,
          s.author_id,
          s.author_name,
          s.description,
          s.cover_image_url,
          s.category,
          s.status,
          s.total_chapters,
          s.total_views,
          s.created_at,
          s.updated_at,
          s.is_published,
          s.hidden_by_admin,
          COALESCE(s.total_rating_count, 0)::int AS rating_count,
          COALESCE(s.average_rating, 0)::float8 AS average_rating,
          COALESCE(s.total_chapters, 0)::int AS chapter_count,
          (
            SELECT COUNT(*)::int
            FROM user_follows uf
            WHERE uf.story_id = s.id
          ) AS follow_count,
          u.id AS author_user_id,
          u.username AS author_username,
          u.full_name AS author_full_name,
          u.avatar_url AS author_avatar_url
        FROM stories s
        LEFT JOIN users u ON u.id = s.author_id
        WHERE s.id = $1
        LIMIT 1
      `;
      params = [storyId];
    } else {
      query = `
        SELECT
          s.id,
          s.title,
          s.slug,
          s.author_id,
          s.author_name,
          s.description,
          s.cover_image_url,
          s.category,
          s.status,
          s.total_chapters,
          s.total_views,
          s.created_at,
          s.updated_at,
          s.is_published,
          s.hidden_by_admin,
          COALESCE(s.total_rating_count, 0)::int AS rating_count,
          COALESCE(s.average_rating, 0)::float8 AS average_rating,
          COALESCE(s.total_chapters, 0)::int AS chapter_count,
          (
            SELECT COUNT(*)::int
            FROM user_follows uf
            WHERE uf.story_id = s.id
          ) AS follow_count,
          u.id AS author_user_id,
          u.username AS author_username,
          u.full_name AS author_full_name,
          u.avatar_url AS author_avatar_url
        FROM stories s
        LEFT JOIN users u ON u.id = s.author_id
        WHERE s.slug = $1
        LIMIT 1
      `;
      params = [slug];
    }

    const result = await db.query(query, params);

    const story = result.rows[0] || null;
    if (!story) return null;

    const tags = await Tag.getTagsForStory(story.id);

    // Lấy danh sách cộng tác viên
    const collaboratorsResult = await db.query(
      `
        SELECT u.id, u.username, u.email, u.full_name, u.avatar_url, sc.created_at
        FROM story_collaborators sc
        INNER JOIN users u ON u.id = sc.user_id
        WHERE sc.story_id = $1
        ORDER BY sc.created_at ASC
      `,
      [story.id]
    );
    const collaborators = collaboratorsResult.rows;

    return { ...story, tags, collaborators };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  searchStories,
  getStoriesByAuthor,
  toggleVisibility,
  getStoryBySlug,
};
