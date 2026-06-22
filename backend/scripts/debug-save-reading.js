const ReadingHistory = require('../src/models/ReadingHistory');

async function run() {
  try {
    console.log('Starting debug saveReadingProgress test...');
    const res = await ReadingHistory.saveReadingProgress(1, 1, 1, 120, 30);
    console.log('Result:', res);
    process.exit(0);
  } catch (err) {
    console.error('Error during saveReadingProgress:', err);
    process.exit(1);
  }
}

run();
