// server/Models/chapterModel.js
// Placeholder model cho chương truyện

class Chapter {
  constructor({ id, storyId, title, content, number }) {
    this.id = id;
    this.storyId = storyId;
    this.title = title;
    this.content = content;
    this.number = number;
  }
}

module.exports = Chapter;
