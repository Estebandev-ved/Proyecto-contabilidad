const sequelize = require('../config/db');
const Category = require('./Category');
const Product = require('./Product');
const Movement = require('./Movement');
const SaleItem = require('./SaleItem');
const CashCut = require('./CashCut');
const DailyLoad = require('./DailyLoad');
const DailyLoadItem = require('./DailyLoadItem');
const ProductBatch = require('./ProductBatch');

// Relationships

// Category has many Products
Category.hasMany(Product, { foreignKey: { name: 'category_id', allowNull: true } });
Product.belongsTo(Category, { foreignKey: { name: 'category_id', allowNull: true } });

// ProductBatch has many Products
ProductBatch.hasMany(Product, { foreignKey: { name: 'batch_id', allowNull: true } });
Product.belongsTo(ProductBatch, { foreignKey: { name: 'batch_id', allowNull: true } });

// Movement (Sale) has many SaleItems
Movement.hasMany(SaleItem, { foreignKey: 'movement_id' });
SaleItem.belongsTo(Movement, { foreignKey: 'movement_id' });

// Product has many SaleItems
Product.hasMany(SaleItem, { foreignKey: 'product_id' });
SaleItem.belongsTo(Product, { foreignKey: 'product_id' });

// DailyLoad has many DailyLoadItems
DailyLoad.hasMany(DailyLoadItem, { foreignKey: 'daily_load_id' });
DailyLoadItem.belongsTo(DailyLoad, { foreignKey: 'daily_load_id' });

// Product has many DailyLoadItems
Product.hasMany(DailyLoadItem, { foreignKey: 'product_id' });
DailyLoadItem.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = {
    sequelize,
    Category,
    Product,
    Movement,
    SaleItem,
    CashCut,
    DailyLoad,
    DailyLoadItem,
    ProductBatch
};
