const db = require('../src/config/database');

const coverImages = [
  // Phàm Nhân Tu Tiên - Tiên Hiệp: núi non sương mù huyền ảo
  { title: 'Phàm Nhân Tu Tiên', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
  // Ngã Dục Phong Thiên - Tiên Hiệp: đỉnh núi bầu trời hùng vĩ
  { title: 'Ngã Dục Phong Thiên', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  // Đấu La Đại Lục - Huyền Huyễn: rừng núi huyền bí màu tím
  { title: 'Đấu La Đại Lục', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80' },
  // Thiên Long Bát Bộ - Kiếm Hiệp: kiếm cổ phong trần
  { title: 'Thiên Long Bát Bộ', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80' },
  // Toàn Chức Pháp Sư - Huyền Huyễn: tia sét ma pháp năng lượng
  { title: 'Toàn Chức Pháp Sư', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=800&q=80' },
  // Hoa Thiên Cốt - Ngôn Tình: hoa anh đào lãng mạn
  { title: 'Hoa Thiên Cốt', url: 'https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?auto=format&fit=crop&w=800&q=80' },
  // Đại Chúa Tể - Huyền Huyễn: vũ trụ kỳ vĩ
  { title: 'Đại Chúa Tể', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' },
  // Thần Ấn Vương Tọa - Huyền Huyễn: ánh sáng thần thánh
  { title: 'Thần Ấn Vương Tọa', url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80' },
  // Khánh Dư Niên - Lịch Sử: cung điện cổ Trung Hoa
  { title: 'Khánh Dư Niên', url: 'https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?auto=format&fit=crop&w=800&q=80' },
  // Đô Thị Siêu Cấp Thần Y - Đô Thị: thành phố ban đêm lung linh
  { title: 'Đô Thị Siêu Cấp Thần Y', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80' },
];

async function update() {
  let ok = 0;
  let fail = 0;

  for (const item of coverImages) {
    try {
      const res = await db.query(
        'UPDATE stories SET cover_image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE title = $2 RETURNING id, title',
        [item.url, item.title]
      );
      if (res.rows[0]) {
        console.log('✓ Updated:', res.rows[0].title, '(id:', res.rows[0].id + ')');
        ok += 1;
      } else {
        console.log('✗ Not found:', item.title);
        fail += 1;
      }
    } catch (e) {
      console.error('✗ Error:', item.title, '—', e.message);
      fail += 1;
    }
  }

  console.log(`\nDone: ${ok} updated, ${fail} failed.`);
  await db.end();
}

update().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
