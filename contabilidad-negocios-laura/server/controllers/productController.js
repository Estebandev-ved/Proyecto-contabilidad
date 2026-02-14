const { Product } = require('../models');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Error fetching products' });
    }
};

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const { name, cost_price, selling_price, current_stock, min_stock_alert } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const product = await Product.create({
            name,
            cost_price,
            selling_price,
            current_stock,
            min_stock_alert,
            image_url
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message || 'Error creating product' });
    }
};

// Update product (edit all fields)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, cost_price, selling_price, current_stock, min_stock_alert } = req.body;
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

        const image_url = req.file ? `/uploads/${req.file.filename}` : product.image_url;

        await product.update({
            name: name || product.name,
            cost_price: cost_price || product.cost_price,
            selling_price: selling_price || product.selling_price,
            current_stock: current_stock !== undefined ? current_stock : product.current_stock,
            min_stock_alert: min_stock_alert !== undefined ? min_stock_alert : product.min_stock_alert,
            image_url
        });

        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
};

// Update product stock
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, type } = req.body; // type: 'add' or 'subtract'

        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (type === 'add') {
            product.current_stock += parseInt(quantity);
        } else if (type === 'subtract') {
            product.current_stock -= parseInt(quantity);
        }

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error updating stock' });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.destroy({ where: { id } });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
};
