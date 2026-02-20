const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const kardexController = require('../controllers/kardexController');
const multer = require('multer');
const path = require('path');

// Configure Multer for Image Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.get('/history', kardexController.getMovementHistory);
router.get('/', productController.getAllProducts);
router.post('/', upload.single('image'), productController.createProduct);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.put('/:id/stock', productController.updateStock);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
