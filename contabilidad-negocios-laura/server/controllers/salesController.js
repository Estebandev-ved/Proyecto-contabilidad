const { Movement, SaleItem, Product, sequelize } = require('../models');

exports.createSale = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { items, total } = req.body;

        // 1. Create the Movement (Sale Record)
        const sale = await Movement.create({
            type: 'SALE',
            amount: total,
            description: 'Venta de productos',
            date: new Date()
        }, { transaction: t });

        // 2. Create Sale Items & Update Stock
        for (const item of items) {
            // Check stock first
            const product = await Product.findByPk(item.id, { transaction: t });
            if (!product) throw new Error(`Producto ${item.id} no encontrado`);

            if (product.current_stock < item.quantity) {
                throw new Error(`Stock insuficiente para ${product.name}`);
            }

            // Deduct stock
            await product.update({
                current_stock: product.current_stock - item.quantity
            }, { transaction: t });

            // Record item in sale
            await SaleItem.create({
                movement_id: sale.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price_at_sale: item.selling_price,
                total: item.selling_price * item.quantity
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json({ message: 'Venta registrada con éxito', saleId: sale.id });

    } catch (error) {
        await t.rollback();
        console.error('Error en venta:', error);
        res.status(500).json({ error: error.message || 'Error al procesar la venta' });
    }
};

exports.getSales = async (req, res) => {
    try {
        const sales = await Movement.findAll({
            where: { type: 'SALE' },
            include: [{
                model: SaleItem,
                include: [Product]
            }],
            order: [['date', 'DESC']]
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo ventas' });
    }
};
