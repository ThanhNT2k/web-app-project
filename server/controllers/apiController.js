// server/Controllers/apiController.js
// API controller trả dữ liệu giả cho frontend.

const stories = [
  {
    id: 1,
    title: 'Truyện Đại Chiến',
    author: 'Nguyễn Văn A',
    status: 'Full',
    genre: 'Hành động',
    chapters: 120,
  },
  {
    id: 2,
    title: 'Hoa Anh Đào',
    author: 'Lê Thị B',
    status: 'Ongoing',
    genre: 'Lãng mạn',
    chapters: 46,
  },
  {
    id: 3,
    title: 'Hành Trình Azure',
    author: 'Trần Minh C',
    status: 'Drop',
    genre: 'Kỳ ảo',
    chapters: 32,
  },
];

const genres = ['Hành động', 'Lãng mạn', 'Kỳ ảo', 'Viễn tưởng', 'Harem', 'Xuyên không'];

const profile = {
  id: 1,
  name: 'Nguyễn Thị Thùy',
  role: 'User',
  favoriteGenres: ['Hành động', 'Lãng mạn'],
  readingHistory: [
    { storyId: 1, chapter: 120 },
    { storyId: 2, chapter: 46 },
  ],
};

exports.getStories = (req, res) => {
  res.json(stories);
};

exports.getStory = (req, res) => {
  const storyId = Number(req.params.id);
  const story = stories.find((item) => item.id === storyId);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }
  res.json(story);
};

exports.getGenres = (req, res) => {
  res.json(genres);
};

exports.getProfile = (req, res) => {
  res.json(profile);
};
