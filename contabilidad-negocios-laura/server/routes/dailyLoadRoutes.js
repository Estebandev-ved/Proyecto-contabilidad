const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dailyLoadController');

router.post('/', ctrl.createDailyLoad);           // Create new load
router.get('/today', ctrl.getTodayLoad);           // Get today's open load
router.get('/', ctrl.getAllLoads);                 // Get all loads (history)
router.post('/sell', ctrl.registerSaleFromLoad);   // Register sale from load
router.put('/:id/close', ctrl.closeDailyLoad);     // Close load (end of day)

module.exports = router;
