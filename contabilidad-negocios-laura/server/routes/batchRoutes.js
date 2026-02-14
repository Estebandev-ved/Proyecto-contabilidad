const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/batchController');

router.post('/', ctrl.createBatch);
router.get('/', ctrl.getAllBatches);
router.get('/:id', ctrl.getBatch);
router.put('/:id', ctrl.updateBatch);
router.post('/:id/products', ctrl.addProductToBatch);
router.put('/:id/products/:productId', ctrl.updateBatchProduct);
router.delete('/:id/products/:productId', ctrl.removeProductFromBatch);
router.delete('/:id', ctrl.deleteBatch);

module.exports = router;
