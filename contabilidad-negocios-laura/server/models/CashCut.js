const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CashCut = sequelize.define('CashCut', {
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    expected_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    actual_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    difference: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = CashCut;
