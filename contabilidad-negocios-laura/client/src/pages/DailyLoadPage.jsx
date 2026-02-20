import React, { useState, useEffect } from 'react';
import { getProducts } from '../api/products';
import api from '../api/axios';
import { Truck, Plus, Minus, PackageCheck, ShoppingBag, ArrowLeftRight, Lock, Clock, CheckCircle2 } from 'lucide-react';

const DailyLoadPage = () => {
    const [products, setProducts] = useState([]);
    const [todayLoad, setTodayLoad] = useState(null);
    const [loadForm, setLoadForm] = useState({}); // { product_id: quantity }
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('load'); // load, sell, summary

    const [selectedDate, setSelectedDate] = useState(() => {
        return localStorage.getItem('dailyLoadDate') || new Date().toISOString().split('T')[0];
    });

    useEffect(() => {
        localStorage.setItem('dailyLoadDate', selectedDate);
        setLoadForm({});
        loadData(selectedDate);
    }, [selectedDate]);

    const loadData = async (date) => {
        setLoading(true);
        try {
            const [prods, loadRes] = await Promise.all([
                getProducts(),
                api.get(`/daily-loads/today?date=${date}`)
            ]);
            setProducts(prods);
            setTodayLoad(loadRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateLoadQty = (productId, delta) => {
        setLoadForm(prev => {
            const current = prev[productId] || 0;
            const newQty = Math.max(0, current + delta);
            if (newQty === 0) {
                const copy = { ...prev };
                delete copy[productId];
                return copy;
            }
            return { ...prev, [productId]: newQty };
        });
    };

    const handleCreateLoad = async () => {
        const items = Object.entries(loadForm).map(([product_id, quantity_taken]) => ({
            product_id: parseInt(product_id),
            quantity_taken: parseInt(quantity_taken)
        })).filter(i => i.quantity_taken > 0);

        if (items.length === 0) {
            alert('Selecciona al menos un producto');
            return;
        }

        try {
            const res = await api.post('/daily-loads', { items, date: selectedDate });
            setTodayLoad(res.data);
            setLoadForm({});
            setTab('sell');
            alert('¡Carga del día creada! Ahora puedes registrar ventas.');
        } catch (error) {
            alert(error.response?.data?.error || 'Error al crear carga');
        }
    };

    // --- SELL FROM LOAD ---
    const [sellForm, setSellForm] = useState({}); // { product_id: quantity }

    const updateSellQty = (productId, delta) => {
        setSellForm(prev => {
            const current = prev[productId] || 0;
            const newQty = Math.max(0, current + delta);
            if (newQty === 0) {
                const copy = { ...prev };
                delete copy[productId];
                return copy;
            }
            return { ...prev, [productId]: newQty };
        });
    };

    const handleSell = async () => {
        const items = Object.entries(sellForm).map(([product_id, quantity]) => ({
            product_id: parseInt(product_id),
            quantity: parseInt(quantity)
        })).filter(i => i.quantity > 0);

        if (items.length === 0) {
            alert('Selecciona productos para vender');
            return;
        }

        try {
            const res = await api.post('/daily-loads/sell', {
                load_id: todayLoad.id,
                items
            });
            setTodayLoad(res.data.load);
            setSellForm({});
            alert(`¡Venta registrada! Total: $${res.data.saleTotal.toFixed(2)}`);
        } catch (error) {
            alert(error.response?.data?.error || 'Error al registrar venta');
        }
    };

    const handleCloseLoad = async () => {
        if (!window.confirm('¿Cerrar la carga del día? Los productos no vendidos regresarán al stock.')) return;

        try {
            const res = await api.put(`/daily-loads/${todayLoad.id}/close`);
            setTodayLoad(res.data);
            setTab('summary');
        } catch (error) {
            alert(error.response?.data?.error || 'Error al cerrar carga');
        }
    };

    if (loading) return <div className="text-center p-10">Cargando...</div>;

    const tabStyle = (t) => `pb-2 px-4 font-medium text-sm flex items-center gap-1 ${tab === t ? 'border-b-2 border-pink-500 text-pink-600' : 'text-gray-500 hover:text-gray-700'}`;

    return (
        <div className="max-w-5xl mx-auto">

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Truck className="text-pink-600" /> Carga del Día
                </h2>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Fecha:</span>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="outline-none text-gray-800 font-bold"
                    />
                </div>
            </div>

            {/* Status Banner */}
            {todayLoad && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${todayLoad.status === 'OPEN'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-gray-50 border border-gray-200 text-gray-600'
                    }`}>
                    {todayLoad.status === 'OPEN' ? (
                        <><CheckCircle2 size={18} /> Carga abierta — {todayLoad.DailyLoadItems?.length || 0} productos cargados</>
                    ) : (
                        <><Lock size={18} /> Carga cerrada — Total vendido: ${parseFloat(todayLoad.total_sold).toFixed(2)}</>
                    )}
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b mb-6">
                <button className={tabStyle('load')} onClick={() => setTab('load')}>
                    <PackageCheck size={16} /> Preparar Carga
                </button>
                <button className={tabStyle('sell')} onClick={() => setTab('sell')}>
                    <ShoppingBag size={16} /> Vender
                </button>
                <button className={tabStyle('summary')} onClick={() => setTab('summary')}>
                    <ArrowLeftRight size={16} /> Resumen
                </button>
            </div>

            {/* ====== TAB: PREPARE LOAD ====== */}
            {tab === 'load' && (
                <div>
                    {todayLoad && todayLoad.status === 'OPEN' ? (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800">
                            <p className="font-bold">Ya tienes una carga abierta para esta fecha.</p>
                            <p className="text-sm mt-1">Ve a la pestaña "Vender" para registrar ventas, o "Resumen" para ver el estado.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-4">
                                Selecciona cuántas unidades de cada producto va a llevar Laura hoy. Se descontarán del stock principal.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.filter(p => p.current_stock > 0).map(product => (
                                    <div key={product.id} className={`bg-white rounded-lg shadow p-4 border-2 transition ${loadForm[product.id] ? 'border-pink-400 shadow-lg' : 'border-transparent'
                                        }`}>
                                        <div className="flex gap-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {product.image_url ? (
                                                    <img src={`http://localhost:5000${product.image_url}`} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">📦</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm text-gray-800">{product.name}</h4>
                                                <p className="text-xs text-gray-500">Stock: {product.current_stock} | ${product.selling_price}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs text-gray-500">Llevar:</span>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateLoadQty(product.id, -1)} className="p-1 bg-gray-200 rounded hover:bg-gray-300">
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-bold text-lg w-8 text-center">{loadForm[product.id] || 0}</span>
                                                <button
                                                    onClick={() => {
                                                        if ((loadForm[product.id] || 0) < product.current_stock) {
                                                            updateLoadQty(product.id, 1);
                                                        }
                                                    }}
                                                    className="p-1 bg-pink-200 rounded hover:bg-pink-300"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {Object.keys(loadForm).length > 0 && (
                                <div className="mt-6 bg-white p-4 rounded-lg shadow-md sticky bottom-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-bold text-gray-700 block">
                                                {Object.values(loadForm).reduce((a, b) => a + b, 0)} unidades de {Object.keys(loadForm).length} productos
                                            </span>
                                            <span className="text-sm text-green-600 font-bold">
                                                Valor Estimado: ${Object.entries(loadForm).reduce((total, [pid, qty]) => {
                                                    const prod = products.find(p => p.id === parseInt(pid));
                                                    return total + (qty * (parseFloat(prod?.selling_price) || 0));
                                                }, 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleCreateLoad}
                                            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 font-bold"
                                        >
                                            🚛 Crear Carga del Día
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ====== TAB: SELL FROM LOAD ====== */}
            {tab === 'sell' && (
                <div>
                    {!todayLoad || todayLoad.status !== 'OPEN' ? (
                        <div className="text-center py-10 text-gray-400">
                            <ShoppingBag size={48} className="mx-auto mb-3" />
                            <p>No hay carga abierta.</p>
                            <p className="text-sm">Primero crea una carga en "Preparar Carga".</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-4">Registra las ventas del día. Selecciona cantidades y dale "Registrar Venta".</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {todayLoad.DailyLoadItems?.map(item => {
                                    const available = item.quantity_taken - item.quantity_sold - item.quantity_returned;
                                    const product = item.Product;
                                    return (
                                        <div key={item.id} className={`bg-white rounded-lg shadow p-4 ${available === 0 ? 'opacity-50' : ''}`}>
                                            <div className="flex gap-3">
                                                <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                    {product?.image_url ? (
                                                        <img src={`http://localhost:5000${product.image_url}`} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">📦</div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm">{product?.name}</h4>
                                                    <div className="text-xs text-gray-500 space-x-2">
                                                        <span>Llevó: {item.quantity_taken}</span>
                                                        <span className="text-green-600">Vendido: {item.quantity_sold}</span>
                                                        <span className="text-blue-600">Disponible: {available}</span>
                                                    </div>
                                                    <p className="text-pink-600 font-bold text-sm">${parseFloat(item.unit_price).toFixed(2)} c/u</p>
                                                </div>
                                            </div>
                                            {available > 0 && (
                                                <div className="flex items-center justify-between mt-3 border-t pt-2">
                                                    <span className="text-xs text-gray-500">Vender:</span>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => updateSellQty(item.product_id, -1)} className="p-1 bg-gray-200 rounded hover:bg-gray-300">
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="font-bold text-lg w-8 text-center">{sellForm[item.product_id] || 0}</span>
                                                        <button
                                                            onClick={() => {
                                                                if ((sellForm[item.product_id] || 0) < available) {
                                                                    updateSellQty(item.product_id, 1);
                                                                }
                                                            }}
                                                            className="p-1 bg-green-200 rounded hover:bg-green-300"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 flex gap-3 sticky bottom-4">
                                {Object.keys(sellForm).length > 0 && (
                                    <button
                                        onClick={handleSell}
                                        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold text-lg"
                                    >
                                        💰 Registrar Venta (${Object.entries(sellForm).reduce((total, [pid, qty]) => {
                                            const item = todayLoad.DailyLoadItems.find(i => i.product_id === parseInt(pid));
                                            return total + (item ? qty * parseFloat(item.unit_price) : 0);
                                        }, 0).toFixed(2)})
                                    </button>
                                )}
                                <button
                                    onClick={handleCloseLoad}
                                    className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-bold flex items-center gap-2"
                                >
                                    <Lock size={18} /> Cerrar Día
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ====== TAB: SUMMARY ====== */}
            {tab === 'summary' && (
                <div>
                    {!todayLoad ? (
                        <div className="text-center py-10 text-gray-400">
                            <Clock size={48} className="mx-auto mb-3" />
                            <p>No hay carga para hoy.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow text-center">
                                    <p className="text-xs text-gray-500">Estado</p>
                                    <p className={`font-bold text-lg ${todayLoad.status === 'OPEN' ? 'text-green-600' : 'text-gray-600'}`}>
                                        {todayLoad.status === 'OPEN' ? '🟢 Abierta' : '🔒 Cerrada'}
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow text-center">
                                    <p className="text-xs text-gray-500">Productos</p>
                                    <p className="font-bold text-lg text-blue-600">{todayLoad.DailyLoadItems?.length || 0}</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow text-center">
                                    <p className="text-xs text-gray-500">Total Llevado</p>
                                    <p className="font-bold text-lg text-purple-600">
                                        {todayLoad.DailyLoadItems?.reduce((s, i) => s + i.quantity_taken, 0) || 0} uds
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow text-center">
                                    <p className="text-xs text-gray-500">Valor Total Carga</p>
                                    <p className="font-bold text-lg text-purple-600">
                                        ${todayLoad.DailyLoadItems?.reduce((s, i) => s + (i.quantity_taken * parseFloat(i.unit_price)), 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow text-center">
                                    <p className="text-xs text-gray-500">Total Vendido</p>
                                    <p className="font-bold text-lg text-green-600">${parseFloat(todayLoad.total_sold).toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Detailed table */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="text-left p-3">Producto</th>
                                            <th className="text-center p-3">Llevó</th>
                                            <th className="text-center p-3">Vendió</th>
                                            <th className="text-center p-3">Regresó</th>
                                            <th className="text-right p-3">Ingreso</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todayLoad.DailyLoadItems?.map(item => {
                                            const returned = todayLoad.status === 'CLOSED'
                                                ? item.quantity_returned
                                                : item.quantity_taken - item.quantity_sold;
                                            return (
                                                <tr key={item.id} className="border-t">
                                                    <td className="p-3 font-medium">{item.Product?.name}</td>
                                                    <td className="text-center p-3">{item.quantity_taken}</td>
                                                    <td className="text-center p-3 text-green-600 font-bold">{item.quantity_sold}</td>
                                                    <td className="text-center p-3 text-orange-600">{returned}</td>
                                                    <td className="text-right p-3 font-bold">${(item.quantity_sold * parseFloat(item.unit_price)).toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr className="font-bold border-t-2">
                                            <td className="p-3">TOTALES</td>
                                            <td className="text-center p-3">{todayLoad.DailyLoadItems?.reduce((s, i) => s + i.quantity_taken, 0)}</td>
                                            <td className="text-center p-3 text-green-600">{todayLoad.DailyLoadItems?.reduce((s, i) => s + i.quantity_sold, 0)}</td>
                                            <td className="text-center p-3 text-orange-600">
                                                {todayLoad.DailyLoadItems?.reduce((s, i) => {
                                                    return s + (todayLoad.status === 'CLOSED' ? i.quantity_returned : i.quantity_taken - i.quantity_sold);
                                                }, 0)}
                                            </td>
                                            <td className="text-right p-3 text-green-600">${parseFloat(todayLoad.total_sold).toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-800 text-sm">
                                <p>💡 <strong>¿Cómo funciona?</strong></p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>Al crear la carga, se descuentan las unidades del stock principal.</li>
                                    <li>Registra cada venta durante el día.</li>
                                    <li>Al "Cerrar Día", todo lo que no se vendió regresa automáticamente al stock.</li>
                                    <li>"Valor Total Carga" es lo que ganarías si vendes TODO lo que cargaste.</li>
                                    <li>El total vendido se refleja en Finanzas → Corte de Caja.</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DailyLoadPage;
