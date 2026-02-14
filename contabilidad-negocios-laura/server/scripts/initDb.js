const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function initializeDatabase() {
    const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASS,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        console.log(`Database "${DB_NAME}" created or already exists.`);

        await connection.end();
    } catch (error) {
        console.error('Error creating database:', error);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Check your MySQL username and password in .env file.');
        }
    }
}

initializeDatabase();
