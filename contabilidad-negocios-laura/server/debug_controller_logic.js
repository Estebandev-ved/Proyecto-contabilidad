const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('contabilidad_laura', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

const DailyLoad = sequelize.define('DailyLoad', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('OPEN', 'CLOSED'),
        defaultValue: 'OPEN'
    }
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        // 2. Simulate querying for '2026-02-14'
        const dateQuery = '2026-02-14';
        const today = new Date().toLocaleDateString('en-CA');
        const searchDate = dateQuery || today;

        const load14 = await DailyLoad.findOne({
            where: { date: searchDate }
        });
        console.log("R14:" + (load14 ? load14.id : 'NULL'));

        // 3. Simulate querying for '2026-02-20'
        const dateQuery2 = '2026-02-20';
        const searchDate2 = dateQuery2 || today;

        const load20 = await DailyLoad.findOne({
            where: { date: searchDate2 }
        });
        console.log("R20:" + (load20 ? load20.id : 'NULL'));

    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
})();
