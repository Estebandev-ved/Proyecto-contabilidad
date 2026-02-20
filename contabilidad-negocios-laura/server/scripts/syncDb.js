const { sequelize } = require('../models');

console.log('Syncing database...');
sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced successfully!');
    process.exit(0);
}).catch(err => {
    console.error('Error syncing database:', err);
    process.exit(1);
});
