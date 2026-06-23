const Redis = require('ioredis');

const db = require('../config/database');
const redisConfig = require('../config/redisConfig');

const VALID_TYPES = new Set(['trending', 'views', 'rating', 'follows']);
const VALID_PERIODS = new Set(['week', 'month', 'all']);
const DEFAULT_LIMIT = 20;
const DEFAULT_CACHE_TTL_SECONDS = 60 * 10;

const memoryCache = new Map();

let redisClient = null;
if (redisConfig?.url) {
  redisClient = new Redis(redisConfig.url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });
  redisClient.on('error', (error) => {
    console.error('[rankingService.redis]', error.message);
  });
}

function normalizeType(type) {
  const value = String(type || 'trending').toLowerCase().trim();
  return VALID_TYPES.has(value) ? value : 'trending';
}

function normalizePeriod(period) {
  const value = String(period || 'week').toLowerCase().trim();
  return VALID_PERIODS.has(value) ? value : 'week';
}

function normalizeLimit(limit) {
  const parsed = parseInt(limit, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, 100);
}

function getCacheKey(type, period, limit) {
  return `rankings:${type}:${period}:${limit}`;
}

function getPeriodWindowSql(period, column) {
  if (period === 'week') {
    return `${column} >= NOW() - INTERVAL '7 days'`;
  }
  if (period === 'month') {
    return `${column} >= NOW() - INTERVAL '30 days'`;
  }
  return 'TRUE';
}

function getViewsMetricSql(period) {
  if (period === 'week') return 'COALESCE(s.weekly_views, 0)::float8';
  if (period === 'month') return 'COALESCE(s.monthly_views, 0)::float8';
  return 'COALESCE(s.total_views, 0)::float8';
}

async function tryGetRedisClient() {
  if (!redisClient) return null;
  if (redisClient.status === 'ready') return redisClient;
  if (redisClient.status === 'connecting') return null;

  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('[rankingService.redis.connect]', error.message);
    return null;
  }
}

async function getCachedRankings(type, period, limit) {
  const key = getCacheKey(type, period, limit);

  const client = await tryGetRedisClient();
  if (client) {
    try {
      const payload = await client.get(key);
      if (payload) return JSON.parse(payload);
    } catch (error) {
      console.error('[rankingService.redis.get]', error.message);
    }
  }

  const local = memoryCache.get(key);
  if (!local) return null;
  if (local.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return local.payload;
}

async function setCachedRankings(type, period, limit, payload, ttlSeconds = DEFAULT_CACHE_TTL_SECONDS) {
  const key = getCacheKey(type, period, limit);

  const client = await tryGetRedisClient();
  if (client) {
    try {
      await client.set(key, JSON.stringify(payload), 'EX', ttlSeconds);
    } catch (error) {
      console.error('[rankingService.redis.set]', error.message);
    }
  }

  memoryCache.set(key, {
    payload,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

async function updateStoryViewAggregates() {
  await db.query(`
    UPDATE stories s
    SET
      weekly_views = COALESCE(v.weekly_views, 0),
      monthly_views = COALESCE(v.monthly_views, 0),
      total_views = COALESCE(v.total_views, 0)
    FROM (
      SELECT
        st.id AS story_id,
        COALESCE(agg.weekly_views, 0)::int AS weekly_views,
        COALESCE(agg.monthly_views, 0)::int AS monthly_views,
        COALESCE(agg.total_views, 0)::int AS total_views
      FROM stories st
      LEFT JOIN (
        SELECT
          story_id,
          COUNT(*) FILTER (WHERE last_read_at >= NOW() - INTERVAL '7 days') AS weekly_views,
          COUNT(*) FILTER (WHERE last_read_at >= NOW() - INTERVAL '30 days') AS monthly_views,
          COUNT(*) AS total_views
        FROM reading_history
        GROUP BY story_id
      ) agg ON agg.story_id = st.id
    ) v
    WHERE s.id = v.story_id
  `);
}

function buildRankingOrderBy(type) {
  if (type === 'views') return 'views_metric DESC, s.created_at DESC';
  if (type === 'rating') return 'rating_avg_metric DESC, rating_count_metric DESC, s.created_at DESC';
  if (type === 'follows') return 'follow_metric DESC, s.created_at DESC';
  return 'trending_score DESC, s.created_at DESC';
}

async function queryRankings(type, period, limit) {
  const ratingFilter = getPeriodWindowSql(period, 'created_at');
  const followFilter = getPeriodWindowSql(period, 'followed_at');
  const viewsMetricSql = getViewsMetricSql(period);

  const orderBy = buildRankingOrderBy(type);

  const result = await db.query(
    `
      WITH follow_stats AS (
        SELECT
          story_id,
          COUNT(*)::int AS follow_count
        FROM user_follows
        WHERE ${followFilter}
        GROUP BY story_id
      ),
      follow_total_stats AS (
        SELECT
          story_id,
          COUNT(*)::int AS total_followers
        FROM user_follows
        GROUP BY story_id
      ),
      rating_stats AS (
        SELECT
          story_id,
          COUNT(*)::int AS rating_count,
          COALESCE(ROUND(AVG(rating)::numeric, 2), 0)::float8 AS average_rating
        FROM ratings
        WHERE ${ratingFilter}
        GROUP BY story_id
      )
      SELECT
        s.id,
        s.title,
        s.slug,
        s.cover_image_url,
        s.category,
        s.status,
        s.total_chapters,
        s.weekly_views,
        s.monthly_views,
        s.total_views,
        s.average_rating,
        s.total_rating_count,
        u.username AS author_username,
        u.full_name AS author_full_name,
        ${viewsMetricSql} AS views_metric,
        COALESCE(fs.follow_count, 0)::float8 AS follow_metric,
        COALESCE(fts.total_followers, 0)::int AS total_followers,
        COALESCE(rs.average_rating, s.average_rating, 0)::float8 AS rating_avg_metric,
        COALESCE(rs.rating_count, 0)::float8 AS rating_count_metric,
        (
          (${viewsMetricSql} * 0.45)
          + (COALESCE(fs.follow_count, 0)::float8 * 0.35 * 15)
          + (COALESCE(rs.average_rating, s.average_rating, 0)::float8 * LN(COALESCE(rs.rating_count, 0)::float8 + 1) * 0.20 * 20)
        )::float8 AS trending_score
      FROM stories s
      LEFT JOIN users u ON u.id = s.author_id
      LEFT JOIN follow_stats fs ON fs.story_id = s.id
      LEFT JOIN follow_total_stats fts ON fts.story_id = s.id
      LEFT JOIN rating_stats rs ON rs.story_id = s.id
      WHERE s.is_published = true AND COALESCE(s.hidden_by_admin, false) = false
      ORDER BY ${orderBy}
      LIMIT $1
    `,
    [limit]
  );

  return result.rows.map((story, index) => ({
    ...story,
    rank: index + 1,
    badge: index === 0 ? 'top1' : index === 1 ? 'top2' : index === 2 ? 'top3' : null,
  }));
}

async function getRankings({ type, period, limit, forceRefresh = false }) {
  const normalizedType = normalizeType(type);
  const normalizedPeriod = normalizePeriod(period);
  const normalizedLimit = normalizeLimit(limit);

  if (!forceRefresh) {
    const cached = await getCachedRankings(normalizedType, normalizedPeriod, normalizedLimit);
    if (cached) {
      return { ...cached, cached: true };
    }
  }

  await updateStoryViewAggregates();
  const stories = await queryRankings(normalizedType, normalizedPeriod, normalizedLimit);

  const payload = {
    type: normalizedType,
    period: normalizedPeriod,
    limit: normalizedLimit,
    updated_at: new Date().toISOString(),
    stories,
  };

  await setCachedRankings(normalizedType, normalizedPeriod, normalizedLimit, payload);
  return { ...payload, cached: false };
}

async function refreshAllRankingCaches(limit = DEFAULT_LIMIT) {
  const tasks = [];
  for (const type of VALID_TYPES) {
    for (const period of VALID_PERIODS) {
      tasks.push(getRankings({ type, period, limit, forceRefresh: true }));
    }
  }

  await Promise.all(tasks);
}

module.exports = {
  normalizeType,
  normalizePeriod,
  normalizeLimit,
  updateStoryViewAggregates,
  queryRankings,
  getRankings,
  refreshAllRankingCaches,
};
