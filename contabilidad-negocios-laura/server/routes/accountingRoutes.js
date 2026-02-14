const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accountingController');

router.post('/expenses', accountingController.createExpense);
router.get('/daily-balance', accountingController.getDailyBalance);
router.post('/cash-cut', accountingController.performCashCut);
router.get('/export', accountingController.exportReport);

module.exports = router;
