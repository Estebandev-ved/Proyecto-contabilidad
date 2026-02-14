const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DailyLoad = sequelize.define('DailyLoad', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('OPEN', 'CLOSED'),
        defaultValue: 'OPEN'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    total_sold: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    }
});

module.exports = DailyLoad;
