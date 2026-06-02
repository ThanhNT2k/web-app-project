const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const env = require('../config/environment');

const BUCKET = 'covers';

/**
 * Returns a configured Supabase client (service role).
 * Returns null if credentials are not configured.
 */
function getSupabase() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return null;
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}

async function uploadCover(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file được tải lên' });
    }

    const supabase = getSupabase();

    // ── Fallback: Supabase not configured ──────────────────────────────────
    // Return a placeholder URL so the rest of the app still works during dev.
    if (!supabase) {
      console.warn('[uploadController] SUPABASE_URL/SUPABASE_SERVICE_KEY not set. Using placeholder URL.');
      const placeholder = `${(env.API_URL || 'http://localhost:5000').replace(/\/$/, '')}/uploads/covers/${Date.now()}-placeholder.jpg`;
      return res.status(200).json({ success: true, url: placeholder, filename: req.file.originalname });
    }

    // ── Upload to Supabase Storage ──────────────────────────────────────────
    const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error('[uploadController] Supabase upload error:', uploadError.message);
      return res.status(500).json({ success: false, message: `Upload thất bại: ${uploadError.message}` });
    }

    // Get the public URL
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);

    return res.status(200).json({
      success: true,
      url: data.publicUrl,
      filename,
    });
  } catch (err) {
    console.error('[uploadController.uploadCover]', err);
    return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
}

module.exports = {
  uploadCover,
};
