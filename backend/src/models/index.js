const db = require('../config/database');
const User = require('./user');
const Story = require('./Story');
const Chapter = require('./Chapter');
const ReadingHistory = require('./ReadingHistory');
const AISummary = require('./AISummary');
const Comment = require('./Comment');
const UserFollow = require('./UserFollow');
const UserPreference = require('./UserPreference');
const BadWord = require('./BadWord');

module.exports = {
  db,
  User,
  Story,
  Chapter,
  ReadingHistory,
  AISummary,
  Comment,
  UserFollow,
  UserPreference,
  BadWord
};