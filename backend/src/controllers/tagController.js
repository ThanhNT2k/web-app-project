const Joi = require('joi');

const Tag = require('../models/Tag');

const createSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
});

async function listTags(req, res) {
  try {
    const tags = await Tag.findAll();
    return res.status(200).json({ success: true, tags });
  } catch (err) {
    console.error('[tagController.listTags]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function createTag(req, res) {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const tag = await Tag.findOrCreate(value.name);
    return res.status(201).json({ success: true, tag });
  } catch (err) {
    console.error('[tagController.createTag]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  listTags,
  createTag,
};
