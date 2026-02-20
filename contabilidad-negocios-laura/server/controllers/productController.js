const { Product, InventoryMovement, sequelize } = require('../models');

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
    const t = await sequelize.transaction();
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
        }, { transaction: t });

        // Log Initial Stock
        if (current_stock > 0) {
            await InventoryMovement.create({
                type: 'IN',
                quantity: current_stock,
                reason: 'Stock Inicial',
                balance_after: current_stock,
                product_id: product.id
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json(product);
    } catch (error) {
        await t.rollback();
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message || 'Error creating product' });
    }
};

// Update product (edit all fields)
exports.updateProduct = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { name, cost_price, selling_price, current_stock, min_stock_alert } = req.body;
        const product = await Product.findByPk(id, { transaction: t });

        if (!product) {
            await t.rollback();
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const oldStock = product.current_stock;
        const image_url = req.file ? `/uploads/${req.file.filename}` : product.image_url;

        await product.update({
            name: name || product.name,
            cost_price: cost_price || product.cost_price,
            selling_price: selling_price || product.selling_price,
            current_stock: current_stock !== undefined ? parseInt(current_stock) : product.current_stock,
            min_stock_alert: min_stock_alert !== undefined ? min_stock_alert : product.min_stock_alert,
            image_url
        }, { transaction: t });

        // Log Manual Adjustment if stock changed
        if (current_stock !== undefined && parseInt(current_stock) !== oldStock) {
            const diff = parseInt(current_stock) - oldStock;
            await InventoryMovement.create({
                type: 'ADJUSTMENT',
                quantity: Math.abs(diff),
                reason: diff > 0 ? 'Ajuste Manual (Entrada)' : 'Ajuste Manual (Salida)',
                balance_after: parseInt(current_stock),
                product_id: product.id
            }, { transaction: t });
        }

        await t.commit();
        res.json(product);
    } catch (error) {
        await t.rollback();
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
};

// Update product stock
exports.updateStock = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { quantity, type } = req.body; // type: 'add' or 'subtract'

        const product = await Product.findByPk(id, { transaction: t });
        if (!product) {
            await t.rollback();
            return res.status(404).json({ error: 'Product not found' });
        }

        let newStock = product.current_stock;
        let reason = '';
        let moveType = '';

        if (type === 'add') {
            newStock += parseInt(quantity);
            reason = 'Ingreso de Stock';
            moveType = 'IN';
        } else if (type === 'subtract') {
            newStock -= parseInt(quantity);
            reason = 'Retiro de Stock';
            moveType = 'OUT';
        }

        await product.update({ current_stock: newStock }, { transaction: t });

        await InventoryMovement.create({
            type: moveType,
            quantity: parseInt(quantity),
            reason: reason,
            balance_after: newStock,
            product_id: product.id
        }, { transaction: t });

        await t.commit();
        res.json(product);
    } catch (error) {
        await t.rollback();
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
