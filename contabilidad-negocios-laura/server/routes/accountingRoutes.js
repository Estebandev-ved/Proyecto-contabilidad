const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accountingController');

router.post('/expenses', accountingController.createExpense);
router.get('/daily-balance', accountingController.getDailyBalance);
router.get('/global-balance', accountingController.getGlobalBalance);
router.post('/cash-cut', accountingController.performCashCut);
router.get('/export', accountingController.exportReport);

/* Reports */
const reportsController = require('../controllers/reportsController');
router.get('/profit-report', reportsController.getProfitReport);
router.get('/product-stats', reportsController.getProductStats);

module.exports = router;
