// Mock data for the story reading platform

export interface Story {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: 'Đang Ra' | 'Hoàn Thành';
  description: string;
  chapters: number;
  views: number;
  rating: number;
  coverImage?: string;
}

export interface Chapter {
  id: string;
  storyId: string;
  number: number;
  title: string;
  content: string;
  publishedDate: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  favoriteStories: string[];
  readingHistory: { storyId: string; chapterId: string; date: string }[];
}

export const mockStories: Story[] = [
  {
    id: '1',
    title: 'Ngã Dục Phong Thiên',
    author: 'Thiên Tàm Thổ Đậu',
    genre: 'Tiên Hiệp',
    status: 'Đang Ra',
    description: 'Tu tiên giả mạo thành phàm nhân, mưu đồ xưng bá cửu thiên!',
    chapters: 3,
    views: 125000,
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Thiên Long Bát Bộ',
    author: 'Kim Dung',
    genre: 'Kiếm Hiệp',
    status: 'Hoàn Thành',
    description: 'Tam đại cao thủ giang hồ, một thời anh hùng ân oán tình thù.',
    chapters: 3,
    views: 250000,
    rating: 4.9,
  },
  {
    id: '3',
    title: 'Đô Thị Siêu Cấp Thần Y',
    author: 'Ngư Nhân Nhị Đại',
    genre: 'Đô Thị',
    status: 'Đang Ra',
    description: 'Bàn tay hồi sinh, cứu người hay diệt địch đều chỉ trong gang tấc!',
    chapters: 3,
    views: 89000,
    rating: 4.5,
  },
  {
    id: '4',
    title: 'Hoa Thiên Cốt',
    author: 'Fresh Quả Quả',
    genre: 'Ngôn Tình',
    status: 'Hoàn Thành',
    description: 'Sư đồ chi tình, cõi nhân gian hay tiên giới cũng không ngăn được.',
    chapters: 3,
    views: 180000,
    rating: 4.7,
  },
  {
    id: '5',
    title: 'Toàn Chức Pháp Sư',
    author: 'Loạn',
    genre: 'Huyền Huyễn',
    status: 'Đang Ra',
    description: 'Xuyên không đến thế giới ma pháp, thanh niên giác ngộ hệ thống toàn năng.',
    chapters: 156,
    views: 450000,
    rating: 4.9,
  },
  {
    id: '6',
    title: 'Ma Đạo Tổ Sư',
    author: 'Mặc Hương Đồng Xú',
    genre: 'Đam Mỹ',
    status: 'Hoàn Thành',
    description: 'Ma tôn Ngụy Vô Tiện tái sinh, giang hồ lại chấn động bởi hắc hóa tổ sư.',
    chapters: 113,
    views: 520000,
    rating: 4.9,
  },
];

export const mockChapters: Chapter[] = [
  {
    id: 'c1-1',
    storyId: '1',
    number: 1,
    title: 'The Discovery',
    content: `The morning sun cast long shadows across the mountain path as Aldric climbed higher into the peaks. He had been walking for three days now, following the ancient map his grandfather had left him.\n\nThe air grew thinner as he ascended, and the temperature dropped with each step. His breath formed small clouds in the cold mountain air.\n\n"There must be something up here," he muttered to himself, checking the map once more. "Grandfather wouldn't have sent me on a fool's errand."\n\nAs he rounded a large boulder, he saw it - a cave entrance, partially hidden by overgrown vines. His heart raced. This had to be the place.\n\nStepping inside, he let his eyes adjust to the darkness. The cave was deeper than he expected, and as he ventured further, a faint glow began to illuminate the path ahead.\n\nIn the center of a vast cavern, sitting on a pedestal of stone, was an egg. But this was no ordinary egg - it pulsed with an inner light, and the air around it shimmered with heat.\n\nA dragon egg.\n\nAldric approached slowly, barely daring to breathe. He had heard the legends his whole life, but he never believed they were true. Dragons were extinct, wiped out in the great war centuries ago.\n\nYet here, before his eyes, was proof that at least one had survived.\n\nAs his hand reached out to touch the smooth surface, the egg began to crack...`,
    publishedDate: '2026-05-15',
  },
  {
    id: 'c1-2',
    storyId: '1',
    number: 2,
    title: 'The Hatching',
    content: `The crack spread across the egg's surface like lightning across a dark sky. Aldric stumbled backward, his heart pounding in his chest.\n\nA high-pitched sound filled the cavern - something between a chirp and a roar. The egg rocked violently on its pedestal, and then, with a final loud crack, a piece of shell fell away.\n\nA small snout pushed through the opening, followed by a scaled head no bigger than Aldric's fist. Two golden eyes blinked at him, studying him with an intelligence that seemed far too ancient for a newborn creature.\n\nThe dragon hatchling pulled itself free from the egg, unfurling wings that were translucent in the cavern's dim light. It was covered in silver scales that caught and reflected the light from the glowing crystals embedded in the cavern walls.\n\n"Hello there," Aldric whispered, kneeling down to be at eye level with the creature.\n\nThe dragon tilted its head, then took a wobbly step forward. It stumbled, unused to its own legs, but quickly regained its balance. With each step, it seemed to grow more confident.\n\nThen something extraordinary happened. As the dragon approached, Aldric felt a presence in his mind - not words exactly, but emotions, images, a sense of connection that went beyond anything he had ever experienced.\n\nIn that moment, he understood. This wasn't just a discovery. This was destiny.\n\nThe dragon and he were now bonded. Forever.`,
    publishedDate: '2026-05-16',
  },
  {
    id: 'c1-3',
    storyId: '1',
    number: 3,
    title: 'The Journey Begins',
    content: `Three days had passed since the hatching. The dragon, whom Aldric had named Ember for the warm glow that seemed to emanate from within her scales, had grown remarkably fast.\n\nShe was now the size of a large dog, and her appetite was insatiable. Aldric had been forced to hunt daily to keep her fed, and even then, she always seemed hungry.\n\nBut more concerning than her appetite was the attention they had attracted. Word had somehow spread about the dragon, and now they were being hunted.\n\n"We need to keep moving," Aldric said, packing up their small camp. "They're getting closer."\n\nEmber chirped in agreement, her golden eyes scanning the forest around them. Through their bond, Aldric could feel her wariness.\n\nThe Kingdom of Valdris wanted the dragon for themselves. They saw her as a weapon, a tool to reclaim the glory of the old empire. But Aldric knew better. Ember was not a weapon - she was a living being, with thoughts and feelings of her own.\n\nAs they continued down the mountain path, Aldric made a decision. They would go to the Sanctuary, the hidden refuge his grandfather had told him about in stories. It was a place where the last dragon riders had fled during the great war.\n\nIf it still existed, it might be their only hope.\n\n"Hold on, Ember," he said, climbing onto her back as she crouched low. "This is going to be a long journey."\n\nWith a powerful beat of her wings, Ember launched into the air, and together they flew toward an uncertain future.`,
    publishedDate: '2026-05-17',
  },
];

// Generate more chapters for story 1
for (let i = 4; i <= 45; i++) {
  mockChapters.push({
    id: `c1-${i}`,
    storyId: '1',
    number: i,
    title: `Chapter ${i}`,
    content: `This is chapter ${i} of The Dragon's Legacy. [Content would be displayed here in the full version]`,
    publishedDate: `2026-05-${Math.min(17 + i, 31)}`,
  });
}

// Sample chapters for other stories
mockChapters.push(
  {
    id: 'c2-1',
    storyId: '2',
    number: 1,
    title: 'Departure',
    content: 'The engines hummed to life as the starship prepared for its final journey from Earth...',
    publishedDate: '2025-01-10',
  },
  {
    id: 'c3-1',
    storyId: '3',
    number: 1,
    title: 'The Call',
    content: 'Detective Morrison received the call at midnight. An old manor, strange lights, disappearances...',
    publishedDate: '2026-04-20',
  }
);

export const mockUser: User = {
  id: 'user1',
  username: 'reader123',
  email: 'reader@example.com',
  favoriteStories: ['1', '2', '6'],
  readingHistory: [
    { storyId: '1', chapterId: 'c1-3', date: '2026-06-01' },
    { storyId: '2', chapterId: 'c2-1', date: '2026-05-30' },
    { storyId: '6', chapterId: 'c1-1', date: '2026-05-28' },
  ],
};

// Helper functions
export const getStoryById = (id: string): Story | undefined => {
  return mockStories.find((story) => story.id === id);
};

export const getChaptersByStoryId = (storyId: string): Chapter[] => {
  return mockChapters.filter((chapter) => chapter.storyId === storyId);
};

export const getChapterById = (chapterId: string): Chapter | undefined => {
  return mockChapters.find((chapter) => chapter.id === chapterId);
};

export const searchStories = (query: string): Story[] => {
  const lowerQuery = query.toLowerCase();
  return mockStories.filter(
    (story) =>
      story.title.toLowerCase().includes(lowerQuery) ||
      story.author.toLowerCase().includes(lowerQuery) ||
      story.genre.toLowerCase().includes(lowerQuery) ||
      story.description.toLowerCase().includes(lowerQuery)
  );
};
