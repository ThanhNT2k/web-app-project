const path = require('path');

const clientRoot = path.join(__dirname, '..', 'wwwroot');

exports.home = (req, res) => {
  res.sendFile(path.join(clientRoot, 'index.html'));
};

exports.login = (req, res) => {
  res.sendFile(path.join(clientRoot, 'login.html'));
};

exports.stories = (req, res) => {
  res.sendFile(path.join(clientRoot, 'stories.html'));
};

exports.genres = (req, res) => {
  res.sendFile(path.join(clientRoot, 'genres.html'));
};

exports.story = (req, res) => {
  res.sendFile(path.join(clientRoot, 'story.html'));
};

exports.chapter = (req, res) => {
  res.sendFile(path.join(clientRoot, 'chapter.html'));
};

exports.profile = (req, res) => {
  res.sendFile(path.join(clientRoot, 'profile.html'));
};
