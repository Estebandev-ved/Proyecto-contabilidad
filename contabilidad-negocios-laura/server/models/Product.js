const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cost_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    selling_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    current_stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    min_stock_alert: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

module.exports = Product;
