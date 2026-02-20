const { InventoryMovement, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getMovementHistory = async (req, res) => {
    try {
        const { startDate, endDate, productId } = req.query;

        // Default to current month if no dates provided
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        const whereClause = {
            createdAt: { [Op.between]: [start, end] }
        };

        if (productId) {
            whereClause.product_id = productId;
        }

        const movements = await InventoryMovement.findAll({
            where: whereClause,
            include: [
                { model: Product, attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Format for frontend
        const history = movements.map(m => ({
            id: m.id,
            date: m.createdAt,
            product: m.Product?.name || 'Producto Eliminado',
            type: m.type, // 'IN', 'OUT', 'ADJUSTMENT'
            quantity: m.quantity,
            reason: m.reason,
            balance_after: m.balance_after
        }));

        res.json(history);

    } catch (error) {
        console.error('Error fetching kardex:', error);
        res.status(500).json({ error: error.message });
    }
};
