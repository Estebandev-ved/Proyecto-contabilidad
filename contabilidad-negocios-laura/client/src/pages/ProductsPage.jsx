import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import { getMovementHistory } from '../api/products';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Calendar } from 'lucide-react';

const ProductsPage = () => {
    const [refresh, setRefresh] = useState(0);
    const [activeTab, setActiveTab] = useState('inventory');
    const [history, setHistory] = useState([]);
    const [historyDates, setHistoryDates] = useState(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = now.toISOString().split('T')[0];
        return { startDate: start, endDate: end };
    });

    const handleProductAdded = () => {
        setRefresh(prev => prev + 1);
    };

    useEffect(() => {
        if (activeTab === 'history') {
            loadHistory();
        }
    }, [activeTab, historyDates]);

    const loadHistory = async () => {
        try {
            const data = await getMovementHistory(historyDates);
            setHistory(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-4">
            <div className="flex gap-4 mb-6 border-b pb-2">
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-4 py-2 font-bold ${activeTab === 'inventory' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'}`}
                >
                    📦 Inventario Actual
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 font-bold ${activeTab === 'history' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'}`}
                >
                    📜 Historial de Movimientos
                </button>
            </div>

            {activeTab === 'inventory' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <ProductForm onProductAdded={handleProductAdded} />
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Inventario Actual</h2>
                        <ProductList refreshTrigger={refresh} />
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex gap-4 mb-6 items-end bg-white p-4 rounded-lg shadow-sm">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Desde</label>
                            <input
                                type="date"
                                value={historyDates.startDate}
                                onChange={(e) => setHistoryDates({ ...historyDates, startDate: e.target.value })}
                                className="border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Hasta</label>
                            <input
                                type="date"
                                value={historyDates.endDate}
                                onChange={(e) => setHistoryDates({ ...historyDates, endDate: e.target.value })}
                                className="border rounded p-2"
                            />
                        </div>
                        <button onClick={loadHistory} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2">
                            <RefreshCw size={16} /> Filtrar
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Producto
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Cantidad
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Motivo / Referencia
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Saldo Final
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(row.date).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-bold">
                                            {row.product}
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${row.type === 'IN' ? 'bg-green-100 text-green-900' :
                                                    row.type === 'OUT' ? 'bg-red-100 text-red-900' :
                                                        'bg-yellow-100 text-yellow-900'
                                                }`}>
                                                {row.type === 'IN' ? 'ENTRADA' : row.type === 'OUT' ? 'SALIDA' : 'AJUSTE'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-bold">
                                            {row.quantity}
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            {row.reason}
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-gray-500">
                                            {row.balance_after}
                                        </td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center text-gray-500">
                                            No hay movimientos en este periodo.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
