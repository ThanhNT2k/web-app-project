const db = require('../config/database');

/**
 * Hàm chuyển tên tag thành slug URL-friendly.
 * Xử lý:
 * 1. Chuyển thường tất cả
 * 2. Chuẩn hóa Unicode NFD (tách dấu ra khỏi ký tự gốc)
 * 3. Loại bỏ dấu tiếng Việt (các combining diacritical marks)
 * 4. Thay đặc biệt: 'đ' → 'd' (vì normalize NFD không xử lý được 'đ')
 * 5. Thay mọi ký tự không phải a-z, 0-9 bằng '-'
 * 6. Loại bỏ '-' thừa ở đầu và cuối chuỗi
 *
 * Ví dụ: "Hành Động" → "hanh-dong", "Tiên Hiệp" → "tien-hiep"
 */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Loại bỏ dấu tiếng Việt (combining marks)
    .replace(/đ/g, 'd')               // Xử lý đặc biệt cho chữ 'đ'
    .replace(/[^a-z0-9]+/g, '-')     // Thay ký tự đặc biệt bằng '-'
    .replace(/(^-|-$)/g, '');        // Bỏ '-' ở đầu và cuối
}

/**
 * Lấy tất cả tags, sắp xếp theo tên A-Z.
 * Dùng cho dropdown chọn thể loại khi tìm kiếm hoặc tạo truyện.
 */
async function findAll() {
  const result = await db.query(
    'SELECT id, name, slug, created_at FROM tags ORDER BY name ASC'
  );
  return result.rows;
}

/**
 * Tìm tag theo slug (dùng trong quá trình findOrCreate để kiểm tra tồn tại).
 */
async function findBySlug(slug) {
  const result = await db.query('SELECT * FROM tags WHERE slug = $1 LIMIT 1', [slug]);
  return result.rows[0] || null;
}

/**
 * Tạo tag mới hoặc bỏ qua nếu đã tồn tại (ON CONFLICT DO UPDATE).
 * Lý do dùng ON CONFLICT DO UPDATE thay vì DO NOTHING:
 * - DO NOTHING sẽ không RETURNING khi có conflict
 * - DO UPDATE SET name = EXCLUDED.name sẽ luôn RETURNING record dù có conflict hay không
 */
async function create(name) {
  const slug = slugify(name);
  const result = await db.query(
    `
      INSERT INTO tags (name, slug)
      VALUES ($1, $2)
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, slug, created_at
    `,
    [name.trim(), slug]
  );
  return result.rows[0];
}

/**
 * Tìm tag theo slug, tạo mới nếu chưa tồn tại (findOrCreate pattern).
 * Kiểm tra theo slug thay vì name để tránh trùng do khác hoa/thường hay dấu.
 * Ví dụ: "Hành Động" và "hanh dong" có cùng slug "hanh-dong" → coi là cùng tag.
 */
async function findOrCreate(name) {
  const slug = slugify(name);
  const existing = await findBySlug(slug);
  if (existing) return existing;  // Tag đã tồn tại, trả về luôn
  return create(name);             // Chưa có, tạo mới
}

/**
 * Lấy danh sách tags của một truyện cụ thể.
 * INNER JOIN story_tags: Bảng quan hệ nhiều-nhiều giữa stories và tags.
 */
async function getTagsForStory(storyId) {
  const result = await db.query(
    `
      SELECT t.id, t.name, t.slug
      FROM tags t
      INNER JOIN story_tags st ON st.tag_id = t.id
      WHERE st.story_id = $1
      ORDER BY t.name ASC
    `,
    [storyId]
  );
  return result.rows;
}

/**
 * Cập nhật toàn bộ tags của một truyện (replace all, không merge).
 * Dùng transaction để đảm bảo:
 * 1. XÓA tất cả tags cũ của truyện
 * 2. TẠO/TÌM từng tag mới
 * 3. GÁN các tag đó cho truyện
 * Nếu bất kỳ bước nào thất bại → ROLLBACK tất cả.
 *
 * ON CONFLICT DO NOTHING trong INSERT story_tags:
 * Tránh lỗi khi cùng một tag được gắn hai lần (trùng lặp trong mảng tagNames).
 */
async function setStoryTags(storyId, tagNames = []) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Bước 1: Xóa tất cả tags cũ của truyện này
    await client.query('DELETE FROM story_tags WHERE story_id = $1', [storyId]);

    // Bước 2: Chuẩn hóa danh sách tag: trim, loại bỏ rỗng, loại bỏ trùng lặp
    const uniqueNames = [...new Set(tagNames.map((n) => String(n).trim()).filter(Boolean))];

    for (const name of uniqueNames) {
      // Bước 3a: Tìm hoặc tạo tag (đảm bảo tag tồn tại trong bảng tags)
      const tag = await findOrCreate(name);

      // Bước 3b: Gán tag cho truyện (bỏ qua nếu đã gán - idempotent)
      await client.query(
        'INSERT INTO story_tags (story_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [storyId, tag.id]
      );
    }

    await client.query('COMMIT');

    // Trả về danh sách tags mới của truyện sau khi cập nhật
    return getTagsForStory(storyId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  findAll,
  findBySlug,
  create,
  findOrCreate,
  getTagsForStory,
  setStoryTags,
  slugify,
};
