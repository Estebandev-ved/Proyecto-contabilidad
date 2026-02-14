const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/salesRoutes');
const accountingRoutes = require('./routes/accountingRoutes');
const dailyLoadRoutes = require('./routes/dailyLoadRoutes');
const batchRoutes = require('./routes/batchRoutes');
const db = require('./config/db');

dotenv.config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads/ directory');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve images

// Routes
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/daily-loads', dailyLoadRoutes);
app.use('/api/batches', batchRoutes);

app.get('/', (req, res) => {
    res.send('API Contabilidad Negocios Laura Running');
});

// Start Server
db.sync({ force: false }).then(() => {
    console.log('Database & tables created!');
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use! Close the other server first.`);
        } else {
            console.error('Server error:', err);
        }
    });
}).catch(err => {
    console.error('Error syncing database:', err);
});

