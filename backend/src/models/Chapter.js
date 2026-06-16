const db = require('../config/database');

/**
 * Lấy danh sách chương của một truyện với pagination và sắp xếp.
 * COUNT(*) OVER(): Window function để lấy tổng số chương mà không cần query COUNT riêng.
 * Thứ tự sắp xếp theo chapter_number (tức là theo số thứ tự chương, không phải thời gian tạo).
 */
async function getChaptersByStory(storyId, page = 1, limit = 10, sort = 'asc') {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
  const offset = (safePage - 1) * safeLimit;

  // Chuyển tham số sort thành SQL ORDER BY direction
  // Chỉ chấp nhận 'desc' → 'DESC', còn lại mặc định là 'ASC' để tránh SQL injection
  const orderDirection = sort === 'desc' ? 'DESC' : 'ASC';

  try {
    const result = await db.query(
      `
        SELECT
          id,
          story_id,
          chapter_number,
          title,
          content,
          created_at,
          updated_at,
          is_published,
          COUNT(*) OVER() AS total_count
        FROM chapters
        WHERE story_id = $1
        ORDER BY chapter_number ${orderDirection}
        LIMIT $2 OFFSET $3
      `,
      [storyId, safeLimit, offset]
    );

    const totalItems = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

    return {
      chapters: result.rows.map(({ total_count, ...chapter }) => chapter),
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
 * Lấy chi tiết một chương cùng với thông tin cơ bản của truyện cha.
 * INNER JOIN stories: Đảm bảo chương phải thuộc về một truyện hợp lệ (referential integrity).
 * Các trường story_* được alias để frontend phân biệt với thông tin của chương.
 */
async function getChapterById(chapterId) {
  try {
    const result = await db.query(
      `
        SELECT
          c.id,
          c.story_id,
          c.chapter_number,
          c.title,
          c.content,
          c.created_at,
          c.updated_at,
          c.is_published,
          s.id AS story_id_ref,
          s.title AS story_title,
          s.slug AS story_slug,
          s.description AS story_description,
          s.cover_image_url AS story_cover_image_url,
          s.category AS story_category,
          s.status AS story_status,
          s.total_chapters AS story_total_chapters,
          s.is_published AS story_is_published,
          s.hidden_by_admin AS story_hidden_by_admin,
          s.author_id AS story_author_id
        FROM chapters c
        INNER JOIN stories s ON s.id = c.story_id
        WHERE c.id = $1
        LIMIT 1
      `,
      [chapterId]
    );

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Tạo chương mới trong một transaction.
 * Transaction đảm bảo tính nhất quán (atomicity):
 * - Nếu INSERT chapter thành công nhưng UPDATE total_chapters thất bại → ROLLBACK cả hai
 * - Không để tình trạng có chapter trong DB nhưng total_chapters không khớp
 *
 * Luồng transaction:
 * 1. BEGIN: Bắt đầu transaction
 * 2. INSERT chapter mới
 * 3. UPDATE total_chapters += 1 cho story
 * 4. COMMIT: Xác nhận cả hai thay đổi
 * 5. ROLLBACK nếu có bất kỳ lỗi nào
 */
async function createChapter(chapterData) {
  // Lấy một client riêng từ pool để thực hiện transaction
  // (cần dùng cùng một connection để BEGIN/COMMIT hoạt động đúng)
  const client = await db.connect();

  try {
    await client.query('BEGIN'); // Bắt đầu transaction

    // Bước 1: Tạo chương mới
    const insertResult = await client.query(
      `
        INSERT INTO chapters (story_id, chapter_number, title, content)
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          story_id,
          chapter_number,
          title,
          content,
          created_at,
          updated_at,
          is_published
      `,
      [chapterData.story_id, chapterData.chapter_number, chapterData.title || null, chapterData.content || null]
    );

    // Bước 2: Tăng tổng số chương của truyện lên 1
    // Tự động cập nhật updated_at để story xuất hiện trong sort 'updated'
    await client.query(
      `
        UPDATE stories
        SET total_chapters = total_chapters + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [chapterData.story_id]
    );

    await client.query('COMMIT'); // Xác nhận cả hai thay đổi
    return insertResult.rows[0];
  } catch (error) {
    // Nếu có lỗi ở bất kỳ bước nào, rollback tất cả để tránh dữ liệu không nhất quán
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Luôn trả client về pool dù thành công hay thất bại
    client.release();
  }
}

/**
 * Cập nhật nội dung chương (title và/hoặc content).
 * Dùng COALESCE để partial update: chỉ cập nhật trường được gửi lên.
 */
async function updateChapter(id, chapterData) {
  const { title, content } = chapterData;

  try {
    const result = await db.query(
      `
        UPDATE chapters
        SET
          title = COALESCE($1, title),
          content = COALESCE($2, content),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING
          id,
          story_id,
          chapter_number,
          title,
          content,
          created_at,
          updated_at,
          is_published
      `,
      [title || null, content || null, id]
    );

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Xóa chương (hard delete) trong một transaction.
 * Đồng thời giảm total_chapters của truyện cha xuống 1.
 *
 * GREATEST(total_chapters - 1, 0): Đảm bảo total_chapters không âm
 * kể cả khi dữ liệu có vấn đề (tránh giá trị -1, -2,...).
 *
 * Transaction đảm bảo: nếu xóa chapter thành công nhưng update story thất bại → rollback cả hai.
 */
async function deleteChapter(id) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Bước 1: Lấy story_id của chapter trước khi xóa để biết cần update story nào
    const chapterResult = await client.query('SELECT story_id FROM chapters WHERE id = $1 LIMIT 1', [id]);
    const chapter = chapterResult.rows[0];

    // Nếu chapter không tồn tại, rollback và trả về null
    if (!chapter) {
      await client.query('ROLLBACK');
      return null;
    }

    // Bước 2: Xóa chapter khỏi database
    const deleteResult = await client.query(
      `
        DELETE FROM chapters
        WHERE id = $1
        RETURNING
          id,
          story_id,
          chapter_number,
          title,
          content,
          created_at,
          updated_at,
          is_published
      `,
      [id]
    );

    // Bước 3: Giảm total_chapters của story, đảm bảo không âm bằng GREATEST
    await client.query(
      `
        UPDATE stories
        SET total_chapters = GREATEST(total_chapters - 1, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [chapter.story_id]
    );

    await client.query('COMMIT');
    return deleteResult.rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Đếm tổng số chương của một truyện.
 * COUNT(*)::int: Cast bigint sang integer để dễ sử dụng ở JavaScript.
 */
async function getChapterCount(storyId) {
  try {
    const result = await db.query('SELECT COUNT(*)::int AS count FROM chapters WHERE story_id = $1', [storyId]);
    return result.rows[0] ? result.rows[0].count : 0;
  } catch (error) {
    throw error;
  }
}

/**
 * Lấy chi tiết một chương dựa vào slug của truyện và số thứ tự chương (chapter_number).
 * Dùng cho URL định dạng SEO: /:storySlug/:chapterNumber
 */
async function getChapterBySlugAndNumber(storySlug, chapterNumber) {
  try {
    const match = storySlug.match(/^(\d+)(?:-(.*))?$/);
    let query, params;

    if (match) {
      const storyId = parseInt(match[1], 10);
      query = `
        SELECT
          c.id,
          c.story_id,
          c.chapter_number,
          c.title,
          c.content,
          c.created_at,
          c.updated_at,
          c.is_published,
          s.id AS story_id_ref,
          s.title AS story_title,
          s.slug AS story_slug,
          s.description AS story_description,
          s.cover_image_url AS story_cover_image_url,
          s.category AS story_category,
          s.status AS story_status,
          s.total_chapters AS story_total_chapters,
          s.is_published AS story_is_published,
          s.hidden_by_admin AS story_hidden_by_admin,
          s.author_id AS story_author_id
        FROM chapters c
        INNER JOIN stories s ON s.id = c.story_id
        WHERE s.id = $1 AND c.chapter_number = $2
        LIMIT 1
      `;
      params = [storyId, parseInt(chapterNumber, 10)];
    } else {
      query = `
        SELECT
          c.id,
          c.story_id,
          c.chapter_number,
          c.title,
          c.content,
          c.created_at,
          c.updated_at,
          c.is_published,
          s.id AS story_id_ref,
          s.title AS story_title,
          s.slug AS story_slug,
          s.description AS story_description,
          s.cover_image_url AS story_cover_image_url,
          s.category AS story_category,
          s.status AS story_status,
          s.total_chapters AS story_total_chapters,
          s.is_published AS story_is_published,
          s.hidden_by_admin AS story_hidden_by_admin,
          s.author_id AS story_author_id
        FROM chapters c
        INNER JOIN stories s ON s.id = c.story_id
        WHERE s.slug = $1 AND c.chapter_number = $2
        LIMIT 1
      `;
      params = [storySlug, parseInt(chapterNumber, 10)];
    }

    const result = await db.query(query, params);

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getChaptersByStory,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  getChapterCount,
  getChapterBySlugAndNumber,
};