export const mockStories = [
  {
    id: 1,
    title: 'Phàm Nhân Tu Tiên',
    slug: 'pham-nhan-tu-tien',
    author_name: 'Vong Ngữ',
    category: 'Tiên Hiệp',
    description: 'Hàn Lập bước vào con đường tu tiên từ thân phận bình phàm, trải qua vô vàn thử thách để đạt đến cảnh giới bất tử.',
    // Tiên Hiệp — núi non sương mù huyền ảo
    cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    total_chapters: 1200,
    chapter_count: 1200,
    status: 'Completed',
  },
  {
    id: 5,
    title: 'Toàn Chức Pháp Sư',
    slug: 'toan-chuc-phap-su',
    author_name: 'Loạn',
    category: 'Huyền Huyễn',
    description: 'Thế giới nơi ma pháp thay thế khoa học hiện đại, Mạc Phàm sở hữu hệ thống tu luyện hoàn hảo nhất.',
    // Huyền Huyễn — tia sét ma pháp năng lượng
    cover_image_url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=800&q=80',
    total_chapters: 300,
    chapter_count: 300,
    status: 'Ongoing',
  },
  {
    id: 9,
    title: 'Khánh Dư Niên',
    slug: 'khanh-du-nien',
    author_name: 'Mao Ni',
    category: 'Lịch Sử',
    description: 'Phạm Nhàn mang ký ức hiện đại đối mặt mưu mô triều đình và thế lực quyền quý trong thế giới cổ đại.',
    // Lịch Sử — cung điện cổ Trung Hoa
    cover_image_url: 'https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?auto=format&fit=crop&w=800&q=80',
    total_chapters: 160,
    chapter_count: 160,
    status: 'Completed',
  },
  {
    id: 6,
    title: 'Hoa Thiên Cốt',
    slug: 'hoa-thien-cot',
    author_name: 'Fresh Guo Guo',
    category: 'Ngôn Tình',
    description: 'Mối tình ngang trái đầy bi thương giữa Hoa Thiên Cốt và sư phụ Bạch Tử Họa nơi tiên môn.',
    // Ngôn Tình — hoa anh đào lãng mạn
    cover_image_url: 'https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?auto=format&fit=crop&w=800&q=80',
    total_chapters: 200,
    chapter_count: 200,
    status: 'Completed',
  },
  {
    id: 4,
    title: 'Thiên Long Bát Bộ',
    slug: 'thien-long-bat-bo',
    author_name: 'Kim Dung',
    category: 'Kiếm Hiệp',
    description: 'Giang hồ ân oán bi tráng với ba nhân vật trung tâm: Tiêu Phong, Đoàn Dự và Hư Trúc.',
    // Kiếm Hiệp — kiếm cổ phong trần
    cover_image_url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    total_chapters: 500,
    chapter_count: 500,
    status: 'Completed',
  },
  {
    id: 10,
    title: 'Đô Thị Siêu Cấp Thần Y',
    slug: 'do-thi-sieu-cap-than-y',
    author_name: 'CMC Author',
    category: 'Đô Thị',
    description: 'Một thanh niên bình thường thừa hưởng y thuật thượng cổ, trở thành thần y huyền thoại giữa đô thị hiện đại.',
    // Đô Thị — thành phố ban đêm lung linh
    cover_image_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80',
    total_chapters: 180,
    chapter_count: 180,
    status: 'Ongoing',
  },
];


export const mockChapter = {
  id: 101,
  story_id: 1,
  chapter_number: 1,
  title: 'Thiếu Niên Nghèo',
  content: 'Nội dung mẫu để giao diện vẫn hiển thị khi backend chưa phản hồi.',
  story_title: 'Phàm Nhân Tu Tiên',
  story_slug: 'pham-nhan-tu-tien',
  story_description: 'Hàn Lập bước vào con đường tu tiên từ thân phận bình phàm, trải qua vô vàn thử thách để đạt đến cảnh giới bất tử.',
  story_cover_image_url: mockStories[0].cover_image_url,
  story_category: 'Tiên Hiệp',
  story_status: 'Completed',
  story_total_chapters: 1200,
};


export const mockComments = [
  { id: 1, user_name: 'reader01', content: 'Truyện quá hay, đọc mê luôn!', created_at: '2026-06-01T08:00:00Z' },
  { id: 2, user_name: 'reader02', content: 'Chương này cao trào quá, không thể ngừng đọc.', created_at: '2026-06-01T09:15:00Z' },
  { id: 3, user_name: 'reader03', content: 'Cốt truyện rất hấp dẫn, mong tác giả cập nhật thường xuyên.', created_at: '2026-06-01T10:30:00Z' },
];