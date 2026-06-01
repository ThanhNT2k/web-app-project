const Joi = require('joi');

const UserPreference = require('../models/UserPreference');

const updateSchema = Joi.object({
  dark_mode: Joi.boolean(),
  font_size: Joi.number().integer().min(12).max(32),
  line_spacing: Joi.number().min(1).max(3),
  font_family: Joi.string().max(100),
  theme_color: Joi.string().max(50),
  auto_bookmark: Joi.boolean(),
}).min(1);

async function getPreferences(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let prefs = await UserPreference.getByUserId(req.user.id);
    if (!prefs) {
      prefs = await UserPreference.upsert(req.user.id, UserPreference.defaults);
    }

    return res.status(200).json({ success: true, preferences: prefs });
  } catch (err) {
    console.error('[preferencesController.getPreferences]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function updatePreferences(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => d.message),
      });
    }

    const prefs = await UserPreference.upsert(req.user.id, value);
    return res.status(200).json({ success: true, preferences: prefs });
  } catch (err) {
    console.error('[preferencesController.updatePreferences]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  getPreferences,
  updatePreferences,
};
