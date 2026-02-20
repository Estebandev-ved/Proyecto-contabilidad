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
    },
    total_sold: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    }
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Fix the specific load ID 3 which was created for 2026-02-20 but saved wrong
        // I know ID 3 is the one because user just created it and reported it missing
        const [results, metadata] = await sequelize.query(
            "UPDATE DailyLoads SET date = '2026-02-20' WHERE id = 3 AND status = 'OPEN'"
        );
        console.log("Update results:", results);

        const loads = await DailyLoad.findAll();
        console.log("----- LOADS AFTER FIX -----");
        console.log(JSON.stringify(loads.map(l => ({ id: l.id, date: l.date, status: l.status })), null, 2));
        console.log("-----------------------");
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
})();
