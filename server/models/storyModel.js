// server/Models/storyModel.js
// Placeholder model cho truyện

class Story {
  constructor({ id, title, author, status, genre, chapters }) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.status = status;
    this.genre = genre;
    this.chapters = chapters || [];
  }
}

module.exports = Story;
