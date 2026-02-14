import React, { useState, useEffect } from 'react';
import { createExpense, getDailyBalance, performCashCut, downloadReport } from '../api/accounting';
import { DollarSign, FileText, ClipboardCheck, ShoppingBag, Clock } from 'lucide-react';
import api from '../api/axios';

const AccountingPage = () => {
    const [activeTab, setActiveTab] = useState('sales-history');
    const [balance, setBalance] = useState({ sales: 0, expenses: 0, expectedCash: 0 });
    const [sales, setSales] = useState([]);

    // Form States
    const [expenseForm, setExpenseForm] = useState({ amount: '', description: '' });
    const [cutForm, setCutForm] = useState({ actual_amount: '', notes: '' });

    useEffect(() => {
        if (activeTab === 'cash-cut') {
            loadBalance();
        }
        if (activeTab === 'sales-history') {
            loadSales();
        }
    }, [activeTab]);

    const loadBalance = async () => {
        try {
            const data = await getDailyBalance();
            setBalance(data);
        } catch (error) {
            console.error('Error loading balance');
        }
    };

    const loadSales = async () => {
        try {
            const response = await api.get('/sales');
            setSales(response.data);
        } catch (error) {
            console.error('Error loading sales');
        }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        try {
            await createExpense(expenseForm);
            alert('Gasto registrado');
            setExpenseForm({ amount: '', description: '' });
        } catch (error) {
            alert('Error al registrar gasto');
        }
    };

    const handleCutSubmit = async (e) => {
        e.preventDefault();
        try {
            await performCashCut({
                expected_amount: balance.expectedCash,
                actual_amount: cutForm.actual_amount,
                notes: cutForm.notes
            });
            alert('Corte de caja guardado correctamente');
            setCutForm({ actual_amount: '', notes: '' });
            loadBalance();
        } catch (error) {
            alert('Error al guardar corte');
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('es-MX', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const tabStyle = (tab) => `pb-2 px-4 font-medium text-sm ${activeTab === tab ? 'border-b-2 border-pink-500 text-pink-600' : 'text-gray-500 hover:text-gray-700'}`;

    return (
        <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <DollarSign className="text-pink-600" /> Finanzas y Control
            </h2>

            {/* Tabs */}
            <div className="flex border-b mb-6 overflow-x-auto">
                <button className={tabStyle('sales-history')} onClick={() => setActiveTab('sales-history')}>
                    <span className="flex items-center gap-1"><ShoppingBag size={16} /> Ventas del Día</span>
                </button>
                <button className={tabStyle('expenses')} onClick={() => setActiveTab('expenses')}>
                    Registrar Gastos
                </button>
                <button className={tabStyle('cash-cut')} onClick={() => setActiveTab('cash-cut')}>
                    Corte de Caja
                </button>
                <button className={tabStyle('reports')} onClick={() => setActiveTab('reports')}>
                    Reportes
                </button>
            </div>

            {/* ---- SALES HISTORY ---- */}
            {activeTab === 'sales-history' && (
                <div>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                        <p className="text-green-800 text-sm">
                            💡 Cada vez que cobras una venta, se guarda aquí automáticamente y se suma al balance de la caja.
                        </p>
                    </div>

                    {sales.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <Clock size={48} className="mx-auto mb-3" />
                            <p>No hay ventas registradas aún.</p>
                            <p className="text-sm">Ve a "Vender" y cobra una venta para verla aquí.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sales.map(sale => (
                                <div key={sale.id} className="bg-white rounded-lg shadow-md p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <ShoppingBag size={18} className="text-green-600" />
                                            <span className="font-bold text-gray-700">Venta #{sale.id}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500 block">{formatDate(sale.date)}</span>
                                            <span className="font-bold text-green-600 text-lg">${parseFloat(sale.amount).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {sale.SaleItems && sale.SaleItems.length > 0 && (
                                        <div className="border-t pt-2 mt-2">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-gray-500 text-xs">
                                                        <th className="text-left py-1">Producto</th>
                                                        <th className="text-center py-1">Cant.</th>
                                                        <th className="text-right py-1">Precio</th>
                                                        <th className="text-right py-1">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sale.SaleItems.map(item => (
                                                        <tr key={item.id} className="border-t">
                                                            <td className="py-1">{item.Product?.name || `Producto #${item.product_id}`}</td>
                                                            <td className="text-center py-1">{item.quantity}</td>
                                                            <td className="text-right py-1">${parseFloat(item.unit_price_at_sale).toFixed(2)}</td>
                                                            <td className="text-right py-1 font-bold">${parseFloat(item.total).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ---- EXPENSES ---- */}
            {activeTab === 'expenses' && (
                <div className="bg-white p-6 rounded-lg shadow-md max-w-lg">
                    <h3 className="text-lg font-bold mb-4">Registrar Gasto Operativo</h3>
                    <form onSubmit={handleExpenseSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Monto ($)</label>
                            <input
                                type="number"
                                value={expenseForm.amount}
                                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                required
                                className="mt-1 block w-full border p-2 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descripción / Motivo</label>
                            <textarea
                                value={expenseForm.description}
                                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                required
                                className="mt-1 block w-full border p-2 rounded-md"
                                placeholder="Ej: Bolsas, Pasajes, Etiquetas..."
                            />
                        </div>
                        <button type="submit" className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600">
                            Registrar Salida de Dinero
                        </button>
                    </form>
                </div>
            )}

            {/* ---- CASH CUT ---- */}
            {activeTab === 'cash-cut' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ClipboardCheck size={20} /> Balance del Sistema (Hoy)
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span>Ventas Totales:</span>
                                <span className="font-bold text-green-600">${balance.sales}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Gastos/Retiros:</span>
                                <span className="font-bold text-red-600">-${balance.expenses}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                <span>Debería haber:</span>
                                <span className="text-blue-600">${balance.expectedCash}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-4">Realizar Corte</h3>
                        <form onSubmit={handleCutSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dinero contado en Caja ($)</label>
                                <input
                                    type="number"
                                    value={cutForm.actual_amount}
                                    onChange={(e) => setCutForm({ ...cutForm, actual_amount: e.target.value })}
                                    required
                                    className="mt-1 block w-full border p-2 rounded-md"
                                />
                            </div>

                            {cutForm.actual_amount && (
                                <div className={`p-2 rounded text-sm font-bold ${parseFloat(cutForm.actual_amount) - balance.expectedCash < 0 ? 'bg-red-100 text-red-700' :
                                    parseFloat(cutForm.actual_amount) - balance.expectedCash > 0 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    Diferencia: ${(parseFloat(cutForm.actual_amount) - balance.expectedCash).toFixed(2)}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Notas / Observaciones</label>
                                <textarea
                                    value={cutForm.notes}
                                    onChange={(e) => setCutForm({ ...cutForm, notes: e.target.value })}
                                    className="mt-1 block w-full border p-2 rounded-md"
                                />
                            </div>
                            <button type="submit" className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700">
                                Guardar Corte
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ---- REPORTS ---- */}
            {activeTab === 'reports' && (
                <div className="bg-white p-6 rounded-lg shadow-md max-w-lg text-center">
                    <FileText size={48} className="mx-auto text-green-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Descargar Reporte Excel</h3>
                    <p className="text-gray-600 mb-6">Obtén un archivo detallado con todas las ventas, gastos e inventario.</p>
                    <button
                        onClick={downloadReport}
                        className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-bold flex items-center gap-2 mx-auto"
                    >
                        <FileText size={20} /> Descargar Reporte (.xlsx)
                    </button>
                </div>
            )}
        </div>
    );
};

export default AccountingPage;
