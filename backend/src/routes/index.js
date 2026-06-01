const express = require('express');

const healthController = require('../controllers/healthController');

const router = express.Router();

router.get('/health', healthController.getHealthStatus);

module.exports = router;