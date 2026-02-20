const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Movement = sequelize.define('Movement', {
    type: {
        type: DataTypes.ENUM('SALE', 'EXPENSE', 'INVESTMENT', 'LOSS', 'WITHDRAWAL'),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    batch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'ProductBatches',
            key: 'id'
        }
    },
    from_cash: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Movement;
