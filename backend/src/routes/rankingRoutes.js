const express = require('express');

const rankingController = require('../controllers/rankingController');

const router = express.Router();

router.get('/', rankingController.getRankings);

module.exports = router;
