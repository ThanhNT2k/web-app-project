const fs = require('fs');
const path = require('path');
const controller = require('../src/controllers/readingHistoryController');

async function run() {
  const req = {
    user: { id: 1 },
    body: {
      story_id: 1,
      chapter_id: 1,
      read_position: 200,
      read_time: 15,
    },
  };

  const res = {
    status(code) {
      this._status = code; return this;
    },
    json(obj) { console.log('RESP', this._status || 200, JSON.stringify(obj, null, 2)); return obj; },
  };

  try {
    await controller.saveProgress(req, res);
    process.exit(0);
  } catch (err) {
    console.error('Controller threw:', err);
    process.exit(1);
  }
}

run();
