const { Movement, CashCut, sequelize } = require('../models');
const { Op } = require('sequelize');
const xlsx = require('xlsx');

// 1. Registrar Gasto
exports.createExpense = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const expense = await Movement.create({
            type: 'EXPENSE',
            amount,
            description,
            date: new Date()
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar gasto' });
    }
};

// 2. Obtener Balance del Día (Para Corte de Caja)
exports.getDailyBalance = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const sales = await Movement.sum('amount', {
            where: {
                type: 'SALE',
                date: { [Op.between]: [todayStart, todayEnd] }
            }
        }) || 0;

        const expenses = await Movement.sum('amount', {
            where: {
                type: { [Op.in]: ['EXPENSE', 'WITHDRAWAL'] },
                date: { [Op.between]: [todayStart, todayEnd] }
            }
        }) || 0;

        const expectedCash = sales - expenses;

        res.json({ sales, expenses, expectedCash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo balance' });
    }
};

// 3. Realizar Corte de Caja
exports.performCashCut = async (req, res) => {
    try {
        const { expected_amount, actual_amount, notes } = req.body;
        const difference = actual_amount - expected_amount;

        const cut = await CashCut.create({
            expected_amount,
            actual_amount,
            difference,
            notes,
            date: new Date()
        });

        // Optional: If difference is negative, record as LOSS? 
        // For now just keep the record.

        res.status(201).json(cut);
    } catch (error) {
        res.status(500).json({ error: 'Error registrando corte' });
    }
};

// 4. Exportar Reporte Excel
exports.exportReport = async (req, res) => {
    try {
        const movements = await Movement.findAll({ order: [['date', 'DESC']] });
        const cuts = await CashCut.findAll({ order: [['date', 'DESC']] });

        const wb = xlsx.utils.book_new();

        // Hoja 1: Movimientos
        const wsMovements = xlsx.utils.json_to_sheet(movements.map(m => ({
            ID: m.id,
            Tipo: m.type,
            Monto: m.amount,
            Fecha: m.date,
            Descripcion: m.description
        })));
        xlsx.utils.book_append_sheet(wb, wsMovements, "Movimientos");

        // Hoja 2: Cortes de Caja
        const wsCuts = xlsx.utils.json_to_sheet(cuts.map(c => ({
            Fecha: c.date,
            Esperado: c.expected_amount,
            Real: c.actual_amount,
            Diferencia: c.difference,
            Notas: c.notes
        })));
        xlsx.utils.book_append_sheet(wb, wsCuts, "Cortes de Caja");

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Contabilidad.xlsx');
        res.send(buffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error generando reporte' });
    }
};
