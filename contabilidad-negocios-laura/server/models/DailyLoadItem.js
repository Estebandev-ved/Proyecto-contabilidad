const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DailyLoadItem = sequelize.define('DailyLoadItem', {
    quantity_taken: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'How many units Laura took to sell today'
    },
    quantity_sold: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'How many were actually sold (auto-updated from sales)'
    },
    quantity_returned: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'How many came back unsold'
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Selling price at time of load'
    }
});

module.exports = DailyLoadItem;
