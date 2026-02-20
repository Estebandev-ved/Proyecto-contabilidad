const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InventoryMovement = sequelize.define('InventoryMovement', {
    type: {
        type: DataTypes.ENUM('IN', 'OUT', 'ADJUSTMENT'),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Always positive. Type determines sign.'
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false, // e.g., 'Venta #123', 'Carga Diaria #5', 'Corrección Manual'
    },
    balance_after: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID of Sale, DailyLoad, etc.'
    }
});

module.exports = InventoryMovement;
