const { ProductBatch, Product, SaleItem, sequelize } = require('../models');
const { Op } = require('sequelize');

// Create a new batch with its products
exports.createBatch = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name, total_investment, description, products } = req.body;

        const batch = await ProductBatch.create({
            name,
            total_investment,
            description
        }, { transaction: t });

        if (products && products.length > 0) {
            for (const p of products) {
                await Product.create({
                    name: p.name,
                    cost_price: 0,
                    selling_price: p.selling_price,
                    current_stock: p.current_stock || 0,
                    min_stock_alert: p.min_stock_alert || 5,
                    batch_id: batch.id
                }, { transaction: t });
            }
        }

        await t.commit();

        const fullBatch = await ProductBatch.findByPk(batch.id, {
            include: [Product]
        });

        res.status(201).json(fullBatch);
    } catch (error) {
        await t.rollback();
        console.error('Error creating batch:', error);
        res.status(500).json({ error: error.message });
    }
};

// Helper: calculate batch totals
function calcBatchTotals(batchData) {
    let totalRevenue = 0;
    let totalUnitsSold = 0;
    let totalUnitsInStock = 0;
    let potentialRevenue = 0; // If ALL stock sells

    batchData.Products = batchData.Products.map(product => {
        const productSold = product.SaleItems?.reduce((sum, si) => sum + si.quantity, 0) || 0;
        const productRevenue = product.SaleItems?.reduce((sum, si) => sum + parseFloat(si.total), 0) || 0;

        totalRevenue += productRevenue;
        totalUnitsSold += productSold;
        totalUnitsInStock += product.current_stock;

        // Potential: if every unit in stock + already sold sells at selling_price
        const totalPossibleUnits = productSold + product.current_stock;
        potentialRevenue += totalPossibleUnits * parseFloat(product.selling_price);

        return {
            ...product,
            units_sold: productSold,
            revenue: productRevenue,
            potential_revenue: totalPossibleUnits * parseFloat(product.selling_price)
        };
    });

    const investment = parseFloat(batchData.total_investment);
    return {
        ...batchData,
        totalRevenue,
        totalUnitsSold,
        totalUnitsInStock,
        potentialRevenue,
        profit: totalRevenue - investment,
        projectedProfit: potentialRevenue - investment,
        profitPercentage: totalRevenue > 0
            ? (((totalRevenue - investment) / investment) * 100).toFixed(1)
            : 0,
        projectedProfitPercentage: potentialRevenue > 0
            ? (((potentialRevenue - investment) / investment) * 100).toFixed(1)
            : 0
    };
}

// Get all batches with products, sales, and projected profit
exports.getAllBatches = async (req, res) => {
    try {
        const batches = await ProductBatch.findAll({
            include: [{
                model: Product,
                include: [{
                    model: SaleItem,
                    attributes: ['quantity', 'unit_price_at_sale', 'total']
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        const result = batches.map(b => calcBatchTotals(b.toJSON()));
        res.json(result);
    } catch (error) {
        console.error('Error getting batches:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get single batch detail
exports.getBatch = async (req, res) => {
    try {
        const batch = await ProductBatch.findByPk(req.params.id, {
            include: [{
                model: Product,
                include: [{
                    model: SaleItem,
                    attributes: ['quantity', 'unit_price_at_sale', 'total']
                }]
            }]
        });

        if (!batch) return res.status(404).json({ error: 'Lote no encontrado' });
        res.json(calcBatchTotals(batch.toJSON()));
    } catch (error) {
        console.error('Error getting batch:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update batch (name, investment, description)
exports.updateBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, total_investment, description } = req.body;

        const batch = await ProductBatch.findByPk(id);
        if (!batch) return res.status(404).json({ error: 'Lote no encontrado' });

        await batch.update({
            name: name || batch.name,
            total_investment: total_investment !== undefined ? total_investment : batch.total_investment,
            description: description !== undefined ? description : batch.description
        });

        res.json(batch);
    } catch (error) {
        console.error('Error updating batch:', error);
        res.status(500).json({ error: error.message });
    }
};

// Add product to existing batch
exports.addProductToBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, selling_price, current_stock, min_stock_alert } = req.body;

        const batch = await ProductBatch.findByPk(id);
        if (!batch) return res.status(404).json({ error: 'Lote no encontrado' });

        const product = await Product.create({
            name,
            cost_price: 0,
            selling_price,
            current_stock: current_stock || 0,
            min_stock_alert: min_stock_alert || 5,
            batch_id: id
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error adding product to batch:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update a product within a batch
exports.updateBatchProduct = async (req, res) => {
    try {
        const { id, productId } = req.params;
        const { name, selling_price, current_stock } = req.body;

        const product = await Product.findOne({
            where: { id: productId, batch_id: id }
        });
        if (!product) return res.status(404).json({ error: 'Producto no encontrado en este lote' });

        await product.update({
            name: name || product.name,
            selling_price: selling_price !== undefined ? selling_price : product.selling_price,
            current_stock: current_stock !== undefined ? current_stock : product.current_stock
        });

        res.json(product);
    } catch (error) {
        console.error('Error updating batch product:', error);
        res.status(500).json({ error: error.message });
    }
};

// Remove product from batch
exports.removeProductFromBatch = async (req, res) => {
    try {
        const { id, productId } = req.params;
        const product = await Product.findOne({
            where: { id: productId, batch_id: id }
        });
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

        // Just unlink from batch, don't delete the product
        await product.update({ batch_id: null });
        res.json({ message: 'Producto removido del lote' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a batch
exports.deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.update({ batch_id: null }, { where: { batch_id: id } });
        await ProductBatch.destroy({ where: { id } });
        res.json({ message: 'Lote eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
