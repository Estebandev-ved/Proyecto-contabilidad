const { DailyLoad, DailyLoadItem, Product, Movement, SaleItem, InventoryMovement, sequelize } = require('../models');
const { Op } = require('sequelize');

// Create a new daily load
exports.createDailyLoad = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { items, date } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Debes seleccionar al menos un producto' });
        }

        // If date is provided, use it directly as string if possible to avoid timezone shifts
        // If not, use local date string for today
        let loadDate = date;
        if (!loadDate) {
            const now = new Date();
            loadDate = now.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
        }

        // Check if load already exists for this date
        const existingLoad = await DailyLoad.findOne({
            where: {
                where: {
                    date: loadDate
                },
            },
            transaction: t
        });

        if (existingLoad) {
            await t.rollback();
            return res.status(400).json({ error: 'Ya existe una carga para esta fecha' });
        }

        const load = await DailyLoad.create({
            date: loadDate,
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

            // Log Movement (OUT to Daily Load)
            await InventoryMovement.create({
                type: 'OUT',
                quantity: parseInt(item.quantity_taken),
                reason: `Carga del Día`, // We will append ID later or just keep generic. Usually ID is better but we don't have load.id inside loop? Ah load is created above.
                balance_after: product.current_stock,
                product_id: product.id,
                reference_id: load.id
            }, { transaction: t });

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

// Get load by date (defaults to today's open load)
exports.getTodayLoad = async (req, res) => {
    try {
        // If date is provided in query, use it. Otherwise use today.
        // Format: YYYY-MM-DD
        const dateQuery = req.query.date;
        const today = new Date().toLocaleDateString('en-CA'); // Local YYYY-MM-DD

        const searchDate = dateQuery || today;

        let whereClause = { date: searchDate };

        // If searching for today, prioritize OPEN status, but show CLOSED if no OPEN exists
        // If searching for past dates, just show whatever exists (likely CLOSED)

        let load = await DailyLoad.findOne({
            where: whereClause,
            include: [{ model: DailyLoadItem, include: [Product] }],
            order: [['createdAt', 'DESC']]
        });

        if (!load) return res.json(null);
        res.json(load);
    } catch (error) {
        console.error('Error getting load:', error);
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

                // Log Movement (IN from Daily Load Return)
                await InventoryMovement.create({
                    type: 'IN',
                    quantity: returned,
                    reason: `Retorno Carga #${load.id}`,
                    balance_after: product.current_stock,
                    product_id: product.id,
                    reference_id: load.id
                }, { transaction: t });
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
