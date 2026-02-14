const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SaleItem = sequelize.define('SaleItem', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    unit_price_at_sale: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
});

module.exports = SaleItem;
