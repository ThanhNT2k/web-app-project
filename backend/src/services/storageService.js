const { createClient } = require('@supabase/supabase-js');

const env = require('../config/environment');

const COVER_BUCKET = 'covers';

function getSupabase() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return null;
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractStorageObjectPath(fileUrl, bucket = COVER_BUCKET) {
  if (!fileUrl || typeof fileUrl !== 'string') return null;
  if (!env.SUPABASE_URL) return null;

  const normalizedBase = env.SUPABASE_URL.replace(/\/$/, '');
  const escapedBase = escapeRegex(normalizedBase);
  const escapedBucket = escapeRegex(bucket);
  const pattern = new RegExp(`^${escapedBase}/storage/v1/object/public/${escapedBucket}/(.+)$`, 'i');
  const match = fileUrl.match(pattern);

  if (!match?.[1]) return null;
  return decodeURIComponent(match[1]);
}

async function deleteStorageObjectByUrl(fileUrl, bucket = COVER_BUCKET) {
  const objectPath = extractStorageObjectPath(fileUrl, bucket);
  if (!objectPath) return { deleted: false, reason: 'not-managed' };

  const supabase = getSupabase();
  if (!supabase) return { deleted: false, reason: 'not-configured' };

  const { error } = await supabase.storage.from(bucket).remove([objectPath]);
  if (error) {
    throw new Error(`Khong the xoa file cu tren Supabase: ${error.message}`);
  }

  return { deleted: true, objectPath };
}

module.exports = {
  COVER_BUCKET,
  getSupabase,
  extractStorageObjectPath,
  deleteStorageObjectByUrl,
};
