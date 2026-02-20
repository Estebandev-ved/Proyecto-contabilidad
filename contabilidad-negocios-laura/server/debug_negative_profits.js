const { SaleItem, Product, Movement, sequelize } = require('./models');
const { Op } = require('sequelize');

(async () => {
    try {
        const start = '2026-02-01';
        const end = '2026-02-28';

        const items = await SaleItem.findAll({
            include: [
                {
                    model: Movement,
                    where: {
                        date: { [Op.between]: [start, end] },
                        type: 'SALE'
                    }
                },
                { model: Product }
            ]
        });

        const fs = require('fs');

        console.log("Analyzing Sales for Loss...");
        let totalLoss = 0;
        let report = "LOSS REPORT:\n";

        items.forEach(item => {
            const qty = item.quantity;
            const salePrice = parseFloat(item.unit_price_at_sale);
            const costPrice = parseFloat(item.Product?.cost_price || 0);
            const profitStr = (salePrice - costPrice).toFixed(2);

            if (costPrice > salePrice) {
                const line = `[LOSS] Product: ${item.Product?.name || item.product_id} | Qty: ${qty} | SalePrice: ${salePrice} | Cost: ${costPrice} | Profit/Unit: ${profitStr} | Total Loss on Item: ${(parseFloat(profitStr) * qty).toFixed(2)}\n`;
                report += line;
                totalLoss += (costPrice - salePrice) * qty;
            }
        });

        report += `Total Calculated Loss from these items: ${totalLoss.toFixed(2)}`;
        fs.writeFileSync('loss_report.txt', report);
        console.log("Report wrote to loss_report.txt");

    } catch (error) {
        console.error(error);
    }
})();
