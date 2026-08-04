const db = require('../config/database');

const UNLOCK_COST = 2;

async function getWallet(userId, page = 1, limit = 20) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const offset = (safePage - 1) * safeLimit;
  const [userResult, transactionResult] = await Promise.all([
    db.query('SELECT crystal_balance FROM users WHERE id = $1 LIMIT 1', [userId]),
    db.query(
      `SELECT id, type, amount, balance_after, chapter_id, description, created_at,
              COUNT(*) OVER() AS total_count
       FROM crystal_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT $2 OFFSET $3`,
      [userId, safeLimit, offset]
    ),
  ]);

  const totalItems = Number(transactionResult.rows[0]?.total_count || 0);
  return {
    crystal_balance: Number(userResult.rows[0]?.crystal_balance || 0),
    transactions: transactionResult.rows.map(({ total_count, ...row }) => row),
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages: Math.ceil(totalItems / safeLimit),
    },
  };
}

async function hasUnlocked(userId, chapterId) {
  if (!userId) return false;
  const result = await db.query(
    'SELECT 1 FROM chapter_unlocks WHERE user_id = $1 AND chapter_id = $2 LIMIT 1',
    [userId, chapterId]
  );
  return result.rowCount > 0;
}

async function unlockChapter(userId, chapterId) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const chapterResult = await client.query(
      `SELECT c.id, c.title, c.chapter_number, c.is_paid, c.is_published,
              s.author_id, s.is_published AS story_is_published,
              s.hidden_by_admin
       FROM chapters c
       JOIN stories s ON s.id = c.story_id
       WHERE c.id = $1
       LIMIT 1`,
      [chapterId]
    );
    const chapter = chapterResult.rows[0];
    if (!chapter || !chapter.is_published || !chapter.story_is_published || chapter.hidden_by_admin) {
      const error = new Error('Chapter not found');
      error.code = 'CHAPTER_NOT_FOUND';
      throw error;
    }
    if (!chapter.is_paid) {
      const error = new Error('Chapter is free');
      error.code = 'CHAPTER_ALREADY_FREE';
      throw error;
    }

    const userResult = await client.query(
      'SELECT crystal_balance FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );
    const balance = Number(userResult.rows[0]?.crystal_balance || 0);
    const existing = await client.query(
      'SELECT unlocked_at FROM chapter_unlocks WHERE user_id = $1 AND chapter_id = $2 LIMIT 1',
      [userId, chapterId]
    );
    if (existing.rowCount) {
      await client.query('COMMIT');
      return { already_unlocked: true, crystal_balance: balance };
    }
    if (balance < UNLOCK_COST) {
      const error = new Error('Insufficient crystals');
      error.code = 'INSUFFICIENT_CRYSTALS';
      error.crystalBalance = balance;
      throw error;
    }

    const newBalance = balance - UNLOCK_COST;
    await client.query('UPDATE users SET crystal_balance = $1 WHERE id = $2', [newBalance, userId]);
    await client.query(
      'INSERT INTO chapter_unlocks (user_id, chapter_id, crystal_cost) VALUES ($1, $2, $3)',
      [userId, chapterId, UNLOCK_COST]
    );
    await client.query(
      `INSERT INTO crystal_transactions
         (user_id, type, amount, balance_after, chapter_id, description)
       VALUES ($1, 'CHAPTER_UNLOCK', $2, $3, $4, $5)`,
      [userId, -UNLOCK_COST, newBalance, chapterId, `Mở khóa chương ${chapter.chapter_number}`]
    );

    // Revenue share for Uploader
    const authorResult = await client.query(
      'UPDATE users SET crystal_earned = crystal_earned + $1 WHERE id = $2 RETURNING crystal_earned',
      [UNLOCK_COST, chapter.author_id]
    );
    const newEarned = authorResult.rows[0]?.crystal_earned || UNLOCK_COST;
    
    await client.query(
      `INSERT INTO crystal_transactions
         (user_id, type, amount, balance_after, chapter_id, description)
       VALUES ($1, 'CHAPTER_REVENUE', $2, $3, $4, $5)`,
      [chapter.author_id, UNLOCK_COST, newEarned, chapterId, `Doanh thu từ chương ${chapter.chapter_number} của ${chapter.title}`]
    );

    await client.query('COMMIT');
    return { already_unlocked: false, crystal_balance: newBalance };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { UNLOCK_COST, getWallet, hasUnlocked, unlockChapter };
