const { SaleItem, Product, Movement, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getProfitReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Date handling fallback
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1); // Start of month default
        const end = endDate ? new Date(endDate) : new Date();
        // Adjust end date to include the full day
        end.setHours(23, 59, 59, 999);

        // Filter for the Movement (Sale) date
        const dateFilter = {
            date: { // Movement uses 'date' not 'createdAt' for business logic usually, checking Movelent.js it has 'date'
                [Op.between]: [start, end]
            },
            type: 'SALE' // Ensure we only get Sales
        };

        // 1. Calculate Sales & Gross Profit
        const salesData = await SaleItem.findAll({
            include: [
                {
                    model: Movement,
                    where: dateFilter,
                    attributes: [] // We don't need Movement fields, just filtering
                },
                { model: Product, attributes: ['cost_price'] }
            ]
        });

        let totalSales = 0;
        let totalCost = 0;

        salesData.forEach(item => {
            const quantity = parseFloat(item.quantity);
            const salePrice = parseFloat(item.unit_price_at_sale);
            const costPrice = parseFloat(item.Product?.cost_price || 0);

            totalSales += quantity * salePrice;
            totalCost += quantity * costPrice;
        });

        const grossProfit = totalSales - totalCost;

        // 2. Calculate Expenses (Operating Expenses only, not Investments)
        const expenses = await Movement.sum('amount', {
            where: {
                type: 'EXPENSE',
                date: { [Op.between]: [start, end] }
            }
        }) || 0;

        const netProfit = grossProfit - expenses;

        res.json({
            period: { start, end },
            financials: {
                totalSales,
                totalCost,
                grossProfit,
                totalExpenses: expenses,
                netProfit
            }
        });

    } catch (error) {
        console.error('Error getting profit report:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getProductStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        const dateFilter = {
            date: { [Op.between]: [start, end] },
            type: 'SALE'
        };

        const items = await SaleItem.findAll({
            include: [
                { model: Movement, where: dateFilter, attributes: [] },
                { model: Product, attributes: ['id', 'name', 'cost_price'] }
            ]
        });

        const stats = {};

        items.forEach(item => {
            const pid = item.product_id;
            const name = item.Product?.name || 'Unknown';
            const qty = item.quantity;
            const salePrice = parseFloat(item.unit_price_at_sale);
            const costPrice = parseFloat(item.Product?.cost_price || 0);

            if (!stats[pid]) {
                stats[pid] = { id: pid, name, quantitySold: 0, revenue: 0, profit: 0 };
            }

            stats[pid].quantitySold += qty;
            stats[pid].revenue += qty * salePrice;
            stats[pid].profit += qty * (salePrice - costPrice);
        });

        const sortedByQty = Object.values(stats).sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 5);
        const sortedByProfit = Object.values(stats).sort((a, b) => b.profit - a.profit).slice(0, 5);

        res.json({
            topSelling: sortedByQty,
            mostProfitable: sortedByProfit
        });

    } catch (error) {
        console.error('Error getting product stats:', error);
        res.status(500).json({ error: error.message });
    }
};
