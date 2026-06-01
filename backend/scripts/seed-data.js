const fs = require('fs');
const path = require('path');
const readline = require('readline');

const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

const schemaPath = path.resolve(__dirname, 'schema.sql');
const shouldReset = process.argv.includes('--reset') || process.argv.includes('--clear');

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function askQuestion(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function confirmReset() {
  if (!shouldReset) {
    return false;
  }

  const answer = await askQuestion('[seed] Clear existing data first? This will delete all rows. Type "yes" to continue: ');
  return answer.toLowerCase() === 'yes';
}

async function clearExistingData(client) {
  await client.query('BEGIN');
  await client.query(`
    TRUNCATE TABLE
      ai_summaries,
      comments,
      user_follows,
      reading_history,
      user_preferences,
      chapters,
      stories,
      users
    RESTART IDENTITY CASCADE
  `);
  await client.query('COMMIT');
}

async function hasExistingSeedData(client) {
  const result = await client.query('SELECT COUNT(*)::int AS count FROM stories');
  return (result.rows[0]?.count || 0) > 0;
}

async function seed() {
  const client = await db.connect();

  try {
    const alreadySeeded = await hasExistingSeedData(client);
    if (alreadySeeded && !shouldReset) {
      console.log('[seed] Database already has stories. Skipping seed.');
      console.log('[seed] To replace data, run: npm run db:seed -- --reset');
      return;
    }

    const confirmed = await confirmReset();

    if (shouldReset && confirmed) {
      console.log('[seed] Clearing existing data...');
      await clearExistingData(client);
      console.log('[seed] Existing data cleared.');
    } else if (shouldReset) {
      console.log('[seed] Reset skipped. Continuing with inserts.');
    }

    const passwordHash = await bcrypt.hash('Password@123', 12);

    await client.query('BEGIN');

    const userSeedData = [
      { username: 'admin', email: 'admin@cmctruyen.vn', fullName: 'Quản Trị Viên', role: 'Admin', bio: 'Quản trị viên hệ thống CMC Truyện.' },
      { username: 'uploader01', email: 'uploader@cmctruyen.vn', fullName: 'Nguyễn Văn Upload', role: 'Uploader', bio: 'Chuyên đăng truyện tiên hiệp và kiếm hiệp.' },
      { username: 'reader01', email: 'reader01@cmctruyen.vn', fullName: 'Trần Minh Đọc', role: 'User', bio: 'Mê truyện tiên hiệp, thích tu luyện.' },
      { username: 'reader02', email: 'reader02@cmctruyen.vn', fullName: 'Lê Thị Hồng', role: 'User', bio: 'Fan ngôn tình và đô thị.' },
      { username: 'reader03', email: 'reader03@cmctruyen.vn', fullName: 'Phạm Quốc Hùng', role: 'User', bio: 'Đọc truyện huyền huyễn mỗi ngày.' },
    ];

    const userIds = [];
    for (const user of userSeedData) {
      const result = await client.query(
        `
          INSERT INTO users (username, email, password, full_name, role, bio)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `,
        [user.username, user.email, passwordHash, user.fullName, user.role, user.bio]
      );
      userIds.push(result.rows[0].id);
    }

    const storiesSeedData = [
      {
        title: 'Phàm Nhân Tu Tiên',
        authorIndex: 1,
        description: 'Hàn Lập bước vào con đường tu tiên từ thân phận bình phàm, trải qua vô vàn thử thách để đạt đến cảnh giới bất tử.',
        // Tiên Hiệp — núi non sương mù, huyền ảo
        coverImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        category: 'Tien Hiep',
        status: 'Completed',
      },
      {
        title: 'Ngã Dục Phong Thiên',
        authorIndex: 1,
        description: 'Hành trình phong thiên xưng đế giữa thế giới tu chân đầy sóng gió và cơ duyên.',
        // Tiên Hiệp — bầu trời đỉnh núi hùng vĩ
        coverImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        category: 'Tien Hiep',
        status: 'Ongoing',
      },
      {
        title: 'Đấu La Đại Lục',
        authorIndex: 1,
        description: 'Đường Tam chuyển sinh vào đại lục hồn sư, nơi không có ma pháp, chỉ có hồn lực và vũ khí hồn.',
        // Huyền Huyễn — rừng núi huyền bí màu tím
        coverImageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
        category: 'Huyen Huyen',
        status: 'Completed',
      },
      {
        title: 'Thiên Long Bát Bộ',
        authorIndex: 1,
        description: 'Giang hồ ân oán bi tráng với ba nhân vật trung tâm: Tiêu Phong, Đoàn Dự và Hư Trúc.',
        // Kiếm Hiệp — kiếm cổ, võ lâm
        coverImageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
        category: 'Kiem Hiep',
        status: 'Completed',
      },
      {
        title: 'Toàn Chức Pháp Sư',
        authorIndex: 1,
        description: 'Thế giới nơi ma pháp thay thế khoa học hiện đại, Mạc Phàm sở hữu hệ thống tu luyện hoàn hảo nhất.',
        // Huyền Huyễn — tia sét ma pháp, năng lượng
        coverImageUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=800&q=80',
        category: 'Huyen Huyen',
        status: 'Ongoing',
      },
      {
        title: 'Hoa Thiên Cốt',
        authorIndex: 1,
        description: 'Mối tình ngang trái đầy bi thương giữa Hoa Thiên Cốt và sư phụ Bạch Tử Họa nơi tiên môn.',
        // Ngôn Tình — hoa anh đào lãng mạn
        coverImageUrl: 'https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?auto=format&fit=crop&w=800&q=80',
        category: 'Ngon Tinh',
        status: 'Completed',
      },
      {
        title: 'Đại Chúa Tể',
        authorIndex: 1,
        description: 'Mục Trần từ một thị trấn nhỏ tiến vào Đại Thiên Thế Giới rộng lớn, chinh phục đỉnh cao quyền năng.',
        // Huyền Huyễn — cảnh quan kỳ vĩ, vũ trụ
        coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        category: 'Huyen Huyen',
        status: 'Ongoing',
      },
      {
        title: 'Thần Ấn Vương Tọa',
        authorIndex: 1,
        description: 'Nhân loại đối mặt cuộc xâm lược của ma tộc, chỉ có sức mạnh thánh điện mới cứu được thế giới.',
        // Huyền Huyễn — ánh sáng thần thánh, thiên đường
        coverImageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
        category: 'Huyen Huyen',
        status: 'Ongoing',
      },
      {
        title: 'Khánh Dư Niên',
        authorIndex: 1,
        description: 'Phạm Nhàn mang ký ức hiện đại đối mặt mưu mô triều đình và thế lực quyền quý trong thế giới cổ đại.',
        // Lịch Sử — cung điện cổ, mái ngói đỏ Trung Hoa
        coverImageUrl: 'https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?auto=format&fit=crop&w=800&q=80',
        category: 'Lich Su',
        status: 'Completed',
      },
      {
        title: 'Đô Thị Siêu Cấp Thần Y',
        authorIndex: 1,
        description: 'Một thanh niên bình thường thừa hưởng y thuật thượng cổ, trở thành thần y huyền thoại giữa đô thị hiện đại.',
        // Đô Thị — thành phố ban đêm lung linh
        coverImageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80',
        category: 'Do Thi',
        status: 'Ongoing',
      },
    ];

    const storyIds = [];
    for (const story of storiesSeedData) {
      const result = await client.query(
        `
          INSERT INTO stories (title, slug, author_id, description, cover_image_url, category, status, total_chapters, is_published)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `,
        [
          story.title,
          slugify(story.title),
          userIds[story.authorIndex],
          story.description,
          story.coverImageUrl,
          story.category,
          story.status,
          0,
          true,
        ]
      );
      storyIds.push(result.rows[0].id);
    }

    const chapterBlueprints = [
      ['Mở Đầu', 'Bước ngoặt', 'Cơ duyên'],
      ['Khởi Nguyên', 'Biến Cố', 'Đột Phá'],
      ['Giác Ngộ', 'Rèn Luyện', 'Đối Đầu'],
      ['Lưu Lạc', 'Hiện Thân', 'Phản Kích'],
      ['Thức Tỉnh', 'Thử Thách', 'Khai Mở'],
      ['Gặp Gỡ', 'Mâu Thuẫn', 'Lựa Chọn'],
      ['Đại Thiên', 'Thiên Tài', 'Thi Đấu'],
      ['Xâm Lược', 'Thiên Phú', 'Tuyển Chọn'],
      ['Cổ Đại', 'Sinh Tồn', 'Tiến Kinh'],
      ['Truyền Thừa', 'Cứu Người', 'Đối Đầu'],
    ];

    const chapterIdsByStory = [];
    for (let storyIndex = 0; storyIndex < storyIds.length; storyIndex += 1) {
      chapterIdsByStory[storyIndex] = [];

      for (let chapterNumber = 1; chapterNumber <= 3; chapterNumber += 1) {
        const title = chapterBlueprints[storyIndex][chapterNumber - 1];
        const content = `Chương ${chapterNumber} của ${storiesSeedData[storyIndex].title}. Đây là nội dung mẫu phục vụ kiểm thử dữ liệu.`;

        const chapterResult = await client.query(
          `
            INSERT INTO chapters (story_id, chapter_number, title, content, is_published)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
          `,
          [storyIds[storyIndex], chapterNumber, title, content, true]
        );

        chapterIdsByStory[storyIndex].push(chapterResult.rows[0].id);
      }

      await client.query('UPDATE stories SET total_chapters = $1 WHERE id = $2', [3, storyIds[storyIndex]]);
    }

    for (let i = 0; i < storiesSeedData.length; i += 1) {
      const tagName = storiesSeedData[i].category;
      const tagSlug = slugify(tagName);
      const tagResult = await client.query(
        `
          INSERT INTO tags (name, slug)
          VALUES ($1, $2)
          ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug
          RETURNING id
        `,
        [tagName, tagSlug]
      );
      const tagId = tagResult.rows[0].id;
      await client.query(
        `
          INSERT INTO story_tags (story_id, tag_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `,
        [storyIds[i], tagId]
      );
    }

    const commentTexts = [
      'Truyện quá hay, đọc mê luôn!',
      'Chương này cao trào quá, không thể ngừng đọc.',
      'Cốt truyện rất hấp dẫn, mong tác giả cập nhật thường xuyên.',
      'Nhân vật chính quá bá đạo, thích ghê!',
      'Hệ thống tu luyện rất logic và chặt chẽ.',
      'Đọc truyện này mất ngủ mấy đêm liền rồi.',
      'Cảm ơn tác giả đã viết một bộ truyện tuyệt vời!',
      'Plot twist chương này khiến mình sốc thật sự.',
      'Mong tác giả không bỏ truyện, đang rất hay.',
      'Văn phong mượt mà, dịch rất tốt.',
      'Truyện có nhiều triết lý sâu sắc về cuộc sống.',
      'Thích cách xây dựng thế giới trong truyện này.',
      'Mối quan hệ giữa các nhân vật rất thú vị.',
      'Chương này hơi ngắn, mong chương sau dài hơn.',
      'Đây là bộ truyện tiên hiệp hay nhất mình từng đọc.',
      'Hệ thống chiến đấu rất sáng tạo và mới lạ.',
      'Đã đọc đi đọc lại ba lần vẫn thấy hay.',
      'Mong tác giả thêm nhiều cảnh chiến đấu hơn.',
      'Nhân vật nữ chính rất có chiều sâu.',
      'Cốt truyện có nhiều bất ngờ, rất khó đoán.',
    ];

    const commentIds = [];
    for (let index = 0; index < 20; index += 1) {
      const userId = userIds[2 + (index % 3)];
      const storyIndex = index % storyIds.length;
      const chapterIndex = index % 3;
      const parentCommentId = index >= 10 ? commentIds[index - 10] : null;

      const commentResult = await client.query(
        `
          INSERT INTO comments (user_id, story_id, chapter_id, content, rating)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `,
        [
          userId,
          storyIds[storyIndex],
          chapterIdsByStory[storyIndex][chapterIndex],
          commentTexts[index],
          3 + (index % 3),
        ]
      );

      commentIds.push(commentResult.rows[0].id);

      if (parentCommentId) {
        await client.query('UPDATE comments SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [parentCommentId]);
      }
    }

    const readingHistorySeed = [
      { userIndex: 2, storyIndex: 0, chapterIndex: 2, position: 120, time: 3600, rate: 1.0 },
      { userIndex: 2, storyIndex: 2, chapterIndex: 1, position: 60, time: 2400, rate: 0.67 },
      { userIndex: 2, storyIndex: 4, chapterIndex: 0, position: 30, time: 900, rate: 0.33 },
      { userIndex: 3, storyIndex: 5, chapterIndex: 2, position: 140, time: 5400, rate: 1.0 },
      { userIndex: 3, storyIndex: 8, chapterIndex: 1, position: 70, time: 1800, rate: 0.67 },
      { userIndex: 4, storyIndex: 1, chapterIndex: 0, position: 20, time: 600, rate: 0.33 },
      { userIndex: 4, storyIndex: 3, chapterIndex: 2, position: 150, time: 4200, rate: 1.0 },
      { userIndex: 4, storyIndex: 6, chapterIndex: 1, position: 80, time: 2100, rate: 0.67 },
    ];

    for (const entry of readingHistorySeed) {
      await client.query(
        `
          INSERT INTO reading_history (
            user_id,
            story_id,
            last_chapter_read,
            last_read_position,
            total_read_time,
            completion_rate
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          userIds[entry.userIndex],
          storyIds[entry.storyIndex],
          chapterIdsByStory[entry.storyIndex][entry.chapterIndex],
          entry.position,
          entry.time,
          entry.rate,
        ]
      );
    }

    const preferences = [
      { userIndex: 0, darkMode: true, fontSize: 16, lineSpacing: 1.5, fontFamily: 'Arial', themeColor: 'default', autoBookmark: true },
      { userIndex: 1, darkMode: false, fontSize: 17, lineSpacing: 1.6, fontFamily: 'Georgia', themeColor: 'sepia', autoBookmark: true },
      { userIndex: 2, darkMode: true, fontSize: 18, lineSpacing: 1.7, fontFamily: 'Verdana', themeColor: 'dark', autoBookmark: true },
      { userIndex: 3, darkMode: false, fontSize: 15, lineSpacing: 1.4, fontFamily: 'Arial', themeColor: 'light', autoBookmark: false },
      { userIndex: 4, darkMode: true, fontSize: 16, lineSpacing: 1.5, fontFamily: 'Tahoma', themeColor: 'midnight', autoBookmark: true },
    ];

    for (const preference of preferences) {
      await client.query(
        `
          INSERT INTO user_preferences (
            user_id,
            dark_mode,
            font_size,
            line_spacing,
            font_family,
            theme_color,
            auto_bookmark
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          userIds[preference.userIndex],
          preference.darkMode,
          preference.fontSize,
          preference.lineSpacing,
          preference.fontFamily,
          preference.themeColor,
          preference.autoBookmark,
        ]
      );
    }

    const summaryCount = 30;
    for (let index = 0; index < summaryCount; index += 1) {
      const storyIndex = index % storyIds.length;
      const chapterIndex = index % 3;

      await client.query(
        `
          INSERT INTO ai_summaries (chapter_id, summary)
          VALUES ($1, $2)
          ON CONFLICT (chapter_id) DO NOTHING
        `,
        [
          chapterIdsByStory[storyIndex][chapterIndex],
          `Tóm tắt mẫu cho ${storiesSeedData[storyIndex].title} - chương ${chapterIndex + 1}.`,
        ]
      );
    }

    await client.query('COMMIT');

    console.log('[seed] Users inserted: 5');
    console.log('[seed] Stories inserted: 10');
    console.log('[seed] Chapters inserted: 30');
    console.log('[seed] Comments inserted: 20');
    console.log('[seed] Reading history inserted: 8');
    console.log('[seed] User preferences inserted: 5');
    console.log('[seed] Seed data inserted successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[seed] Failed to seed database:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.end();
  }
}

seed();
