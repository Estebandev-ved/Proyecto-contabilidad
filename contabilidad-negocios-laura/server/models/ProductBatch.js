const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductBatch = sequelize.define('ProductBatch', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'E.g. "Gomitas de Chamoy"'
    },
    total_investment: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        comment: 'Total investment for this batch (materials, supplies, etc.)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'What is included in this investment'
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'FINISHED'),
        defaultValue: 'ACTIVE'
    }
});

module.exports = ProductBatch;
