const { DailyLoad, DailyLoadItem, Product, Movement, SaleItem, sequelize } = require('../models');
const { Op } = require('sequelize');

// Create a new daily load
exports.createDailyLoad = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Debes seleccionar al menos un producto' });
        }

        const load = await DailyLoad.create({
            date: new Date(),
            status: 'OPEN'
        }, { transaction: t });

        for (const item of items) {
            const product = await Product.findByPk(item.product_id, { transaction: t });
            if (!product) {
                await t.rollback();
                return res.status(404).json({ error: `Producto ${item.product_id} no encontrado` });
            }

            if (product.current_stock < item.quantity_taken) {
                await t.rollback();
                return res.status(400).json({
                    error: `No hay suficiente stock de "${product.name}". Disponible: ${product.current_stock}`
                });
            }

            product.current_stock -= parseInt(item.quantity_taken);
            await product.save({ transaction: t });

            await DailyLoadItem.create({
                daily_load_id: load.id,
                product_id: item.product_id,
                quantity_taken: item.quantity_taken,
                quantity_sold: 0,
                quantity_returned: 0,
                unit_price: product.selling_price
            }, { transaction: t });
        }

        await t.commit();

        const fullLoad = await DailyLoad.findByPk(load.id, {
            include: [{ model: DailyLoadItem, include: [Product] }]
        });

        res.status(201).json(fullLoad);
    } catch (error) {
        await t.rollback();
        console.error('Error creating daily load:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get today's open load
exports.getTodayLoad = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        let load = await DailyLoad.findOne({
            where: { date: today, status: 'OPEN' },
            include: [{ model: DailyLoadItem, include: [Product] }],
            order: [['createdAt', 'DESC']]
        });

        if (!load) return res.json(null);
        res.json(load);
    } catch (error) {
        console.error('Error getting today load:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all loads (history)
exports.getAllLoads = async (req, res) => {
    try {
        const loads = await DailyLoad.findAll({
            include: [{ model: DailyLoadItem, include: [Product] }],
            order: [['date', 'DESC'], ['createdAt', 'DESC']]
        });
        res.json(loads);
    } catch (error) {
        console.error('Error getting loads:', error);
        res.status(500).json({ error: error.message });
    }
};

// Register a sale from the load → ALSO creates Movement + SaleItems for Caja
exports.registerSaleFromLoad = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { load_id, items } = req.body;

        const load = await DailyLoad.findByPk(load_id, { transaction: t });
        if (!load || load.status !== 'OPEN') {
            await t.rollback();
            return res.status(400).json({ error: 'No hay carga abierta' });
        }

        let saleTotal = 0;
        const saleDetails = [];

        for (const item of items) {
            const loadItem = await DailyLoadItem.findOne({
                where: { daily_load_id: load_id, product_id: item.product_id },
                include: [Product],
                transaction: t
            });

            if (!loadItem) {
                await t.rollback();
                return res.status(400).json({ error: 'Producto no está en la carga del día' });
            }

            const available = loadItem.quantity_taken - loadItem.quantity_sold - loadItem.quantity_returned;
            if (item.quantity > available) {
                await t.rollback();
                return res.status(400).json({
                    error: `No hay suficientes de "${loadItem.Product?.name}". Disponible: ${available}`
                });
            }

            loadItem.quantity_sold += parseInt(item.quantity);
            await loadItem.save({ transaction: t });

            const itemTotal = item.quantity * parseFloat(loadItem.unit_price);
            saleTotal += itemTotal;

            saleDetails.push({
                product_id: item.product_id,
                product_name: loadItem.Product?.name || 'Producto',
                quantity: item.quantity,
                unit_price: parseFloat(loadItem.unit_price),
                total: itemTotal
            });
        }

        // ===== CREATE MOVEMENT (SALE) → Goes straight to Caja =====
        const desc = saleDetails.map(d => `${d.quantity}x ${d.product_name}`).join(', ');
        const movement = await Movement.create({
            type: 'SALE',
            amount: saleTotal,
            date: new Date(),
            description: `Venta (Carga): ${desc}`
        }, { transaction: t });

        // Create SaleItems for accounting detail
        for (const detail of saleDetails) {
            await SaleItem.create({
                movement_id: movement.id,
                product_id: detail.product_id,
                quantity: detail.quantity,
                unit_price_at_sale: detail.unit_price,
                total: detail.total
            }, { transaction: t });
        }

        // Update load total
        load.total_sold = parseFloat(load.total_sold || 0) + saleTotal;
        await load.save({ transaction: t });

        await t.commit();

        const updatedLoad = await DailyLoad.findByPk(load_id, {
            include: [{ model: DailyLoadItem, include: [Product] }]
        });

        res.json({ load: updatedLoad, saleTotal });
    } catch (error) {
        await t.rollback();
        console.error('Error registering sale from load:', error);
        res.status(500).json({ error: error.message });
    }
};

// Close the daily load (return unsold items to stock)
exports.closeDailyLoad = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;

        const load = await DailyLoad.findByPk(id, {
            include: [{ model: DailyLoadItem, include: [Product] }],
            transaction: t
        });

        if (!load) {
            await t.rollback();
            return res.status(404).json({ error: 'Carga no encontrada' });
        }

        if (load.status === 'CLOSED') {
            await t.rollback();
            return res.status(400).json({ error: 'Esta carga ya fue cerrada' });
        }

        for (const item of load.DailyLoadItems) {
            const returned = item.quantity_taken - item.quantity_sold;
            item.quantity_returned = returned;
            await item.save({ transaction: t });

            if (returned > 0) {
                const product = await Product.findByPk(item.product_id, { transaction: t });
                product.current_stock += returned;
                await product.save({ transaction: t });
            }
        }

        load.status = 'CLOSED';
        await load.save({ transaction: t });

        await t.commit();

        const closedLoad = await DailyLoad.findByPk(id, {
            include: [{ model: DailyLoadItem, include: [Product] }]
        });

        res.json(closedLoad);
    } catch (error) {
        await t.rollback();
        console.error('Error closing daily load:', error);
        res.status(500).json({ error: error.message });
    }
};
