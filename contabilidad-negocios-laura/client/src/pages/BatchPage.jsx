import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Plus, Trash2, TrendingUp, TrendingDown, X, Edit3, Save, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const BatchPage = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [expandedBatch, setExpandedBatch] = useState(null);

    // Form state
    const [batchName, setBatchName] = useState('');
    const [batchInvestment, setBatchInvestment] = useState('');
    const [batchFromCash, setBatchFromCash] = useState(false);
    const [batchDescription, setBatchDescription] = useState('');
    const [batchProducts, setBatchProducts] = useState([
        { name: '', selling_price: '', current_stock: '', image_url: '' }
    ]);

    // Edit state
    const [editingBatch, setEditingBatch] = useState(null); // batch id being edited
    const [editBatchForm, setEditBatchForm] = useState({});
    const [editingProduct, setEditingProduct] = useState(null); // product id being edited
    const [editProductForm, setEditProductForm] = useState({});

    // Add product to existing batch
    const [addingToBatch, setAddingToBatch] = useState(null);
    const [newProduct, setNewProduct] = useState({ name: '', selling_price: '', current_stock: '', image_url: '' });

    // Add investment to existing batch
    const [addingInvestmentTo, setAddingInvestmentTo] = useState(null);
    const [newInvestment, setNewInvestment] = useState({ amount: '', description: '', from_cash: false });

    useEffect(() => { loadBatches(); }, []);

    const loadBatches = async () => {
        try {
            const res = await api.get('/batches');
            setBatches(res.data);
        } catch (error) {
            console.error('Error loading batches:', error);
        } finally {
            setLoading(false);
        }
    };

    const addProductRow = () => {
        setBatchProducts([...batchProducts, { name: '', selling_price: '', current_stock: '' }]);
    };

    const removeProductRow = (index) => {
        if (batchProducts.length === 1) return;
        setBatchProducts(batchProducts.filter((_, i) => i !== index));
    };

    const updateProductRow = (index, field, value) => {
        const updated = [...batchProducts];
        updated[index][field] = value;
        setBatchProducts(updated);
    };

    const handleCreateBatch = async () => {
        if (!batchName || !batchInvestment) {
            alert('Llena el nombre y la inversión');
            return;
        }
        const validProducts = batchProducts.filter(p => p.name && p.selling_price);
        if (validProducts.length === 0) {
            alert('Agrega al menos un producto con nombre y precio');
            return;
        }
        try {
            await api.post('/batches', {
                name: batchName,
                total_investment: parseFloat(batchInvestment),
                description: batchDescription,
                from_cash: batchFromCash,
                products: validProducts.map(p => ({
                    name: p.name,
                    selling_price: parseFloat(p.selling_price),
                    current_stock: parseInt(p.current_stock) || 0,
                    image_url: p.image_url
                }))
            });
            alert('¡Lote creado!');
            setShowForm(false);
            setBatchName(''); setBatchInvestment(''); setBatchDescription(''); setBatchFromCash(false);
            setBatchProducts([{ name: '', selling_price: '', current_stock: '' }]);
            loadBatches();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al crear lote');
        }
    };

    // --- EDIT BATCH ---
    const startEditBatch = (batch) => {
        setEditingBatch(batch.id);
        setEditBatchForm({
            name: batch.name,
            total_investment: batch.total_investment,
            description: batch.description || ''
        });
    };

    const saveEditBatch = async (id) => {
        try {
            await api.put(`/batches/${id}`, editBatchForm);
            setEditingBatch(null);
            loadBatches();
        } catch (error) {
            alert('Error al editar lote');
        }
    };

    // --- EDIT PRODUCT IN BATCH ---
    const startEditProduct = (product) => {
        setEditingProduct(product.id);
        setEditProductForm({
            name: product.name,
            selling_price: product.selling_price,
            current_stock: product.current_stock,
            image_url: product.image_url || ''
        });
    };

    const saveEditProduct = async (batchId, productId) => {
        try {
            await api.put(`/batches/${batchId}/products/${productId}`, editProductForm);
            setEditingProduct(null);
            loadBatches();
        } catch (error) {
            alert('Error al editar producto');
        }
    };

    // --- ADD PRODUCT TO EXISTING BATCH ---
    const handleAddProduct = async (batchId) => {
        if (!newProduct.name || !newProduct.selling_price) {
            alert('Nombre y precio son obligatorios');
            return;
        }
        try {
            await api.post(`/batches/${batchId}/products`, {
                name: newProduct.name,
                selling_price: parseFloat(newProduct.selling_price),
                current_stock: parseInt(newProduct.current_stock) || 0,
                image_url: newProduct.image_url
            });
            setAddingToBatch(null);
            setNewProduct({ name: '', selling_price: '', current_stock: '', image_url: '' });
            loadBatches();
        } catch (error) {
            alert('Error al agregar producto');
        }
    };

    const handleRemoveProduct = async (batchId, productId, productName) => {
        if (!window.confirm(`¿Quitar "${productName}" del lote?`)) return;
        try {
            await api.delete(`/batches/${batchId}/products/${productId}`);
            loadBatches();
        } catch (error) {
            alert('Error al quitar producto');
        }
    };

    const handleDeleteBatch = async (id, name) => {
        if (!window.confirm(`¿Eliminar el lote "${name}"?`)) return;
        try {
            await api.delete(`/batches/${id}`);
            loadBatches();
        } catch (error) {
            alert('Error al eliminar lote');
        }
    };

    const handleAddInvestment = async (batchId) => {
        if (!newInvestment.amount) {
            alert('El monto es obligatorio');
            return;
        }
        try {
            await api.post(`/batches/${batchId}/investments`, {
                amount: parseFloat(newInvestment.amount),
                description: newInvestment.description,
                from_cash: newInvestment.from_cash
            });
            setAddingInvestmentTo(null);
            setNewInvestment({ amount: '', description: '', from_cash: false });
            loadBatches();
        } catch (error) {
            alert('Error al agregar inversión');
        }
    };

    if (loading) return <div className="text-center p-10">Cargando lotes de inversión...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Package className="text-pink-600" /> Lotes de Inversión
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 flex items-center gap-2 font-medium"
                >
                    <Plus size={18} /> Nuevo Lote
                </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 text-blue-800 text-sm">
                <p>💡 <strong>¿Qué es un Lote de Inversión?</strong></p>
                <p className="mt-1">Cuando compras materiales para hacer varios productos (ej: chamoy, gomas, bolsas = $66,700), crea un lote con esa inversión y agrega todos los productos que salen de ahí. El sistema calcula automáticamente cuánto has ganado y cuánto puedes ganar si vendes todo.</p>
            </div>

            {/* CREATE FORM */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-pink-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Crear Nuevo Lote</h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Lote</label>
                            <input type="text" value={batchName} onChange={(e) => setBatchName(e.target.value)}
                                placeholder="Ej: Gomitas de Chamoy" className="w-full border p-2 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Inversión Total ($)</label>
                            <input type="number" value={batchInvestment} onChange={(e) => setBatchInvestment(e.target.value)}
                                placeholder="Ej: 66700" className="w-full border p-2 rounded-md" />
                            <div className="mt-2 flex items-center">
                                <input type="checkbox" id="fromCash" checked={batchFromCash} onChange={(e) => setBatchFromCash(e.target.checked)} className="mr-2" />
                                <label htmlFor="fromCash" className="text-sm text-gray-600">¿Tomado de la Caja?</label>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué incluye? (Opcional)</label>
                        <input type="text" value={batchDescription} onChange={(e) => setBatchDescription(e.target.value)}
                            placeholder="Ej: Gomas, chamoy, bolsas, bandejas..." className="w-full border p-2 rounded-md" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Productos que salen de este lote:</label>
                        <div className="space-y-2">
                            {batchProducts.map((p, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input type="text" value={p.name} onChange={(e) => updateProductRow(i, 'name', e.target.value)}
                                        placeholder="Nombre" className="flex-1 border p-2 rounded text-sm" />
                                    <input type="number" value={p.selling_price} onChange={(e) => updateProductRow(i, 'selling_price', e.target.value)}
                                        placeholder="Precio" className="w-24 border p-2 rounded text-sm" />
                                    <input type="number" value={p.current_stock} onChange={(e) => updateProductRow(i, 'current_stock', e.target.value)}
                                        placeholder="Stock" className="w-20 border p-2 rounded text-sm" />
                                    <input type="text" value={p.image_url} onChange={(e) => updateProductRow(i, 'image_url', e.target.value)}
                                        placeholder="URL Imagen" className="w-32 border p-2 rounded text-sm" />
                                    <button onClick={() => removeProductRow(i)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addProductRow} className="mt-2 text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1">
                            <Plus size={14} /> Agregar otro producto
                        </button>
                    </div>
                    <button onClick={handleCreateBatch} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold text-lg">
                        ✅ Crear Lote de Inversión
                    </button>
                </div>
            )}

            {/* BATCH LIST */}
            {batches.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <Package size={48} className="mx-auto mb-3" />
                    <p>No hay lotes de inversión.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {batches.map(batch => {
                        const profit = parseFloat(batch.profit) || 0;
                        const isProfit = profit >= 0;
                        const projected = parseFloat(batch.projectedProfit) || 0;
                        const isExpanded = expandedBatch === batch.id;

                        return (
                            <div key={batch.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                {/* Header */}
                                <div className={`p-4 ${isProfit ? 'bg-green-50' : 'bg-red-50'} border-b`}>
                                    <div className="flex justify-between items-center">
                                        {editingBatch === batch.id ? (
                                            <div className="flex-1 mr-4 space-y-2">
                                                <input type="text" value={editBatchForm.name}
                                                    onChange={(e) => setEditBatchForm({ ...editBatchForm, name: e.target.value })}
                                                    className="w-full border p-2 rounded font-bold" />
                                                <div className="flex gap-2">
                                                    <input type="number" value={editBatchForm.total_investment}
                                                        onChange={(e) => setEditBatchForm({ ...editBatchForm, total_investment: e.target.value })}
                                                        className="w-40 border p-2 rounded text-sm" placeholder="Inversión" />
                                                    <input type="text" value={editBatchForm.description}
                                                        onChange={(e) => setEditBatchForm({ ...editBatchForm, description: e.target.value })}
                                                        className="flex-1 border p-2 rounded text-sm" placeholder="Descripción" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => saveEditBatch(batch.id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                                                        <Save size={14} /> Guardar
                                                    </button>
                                                    <button onClick={() => setEditingBatch(null)} className="bg-gray-300 px-3 py-1 rounded text-sm flex items-center gap-1">
                                                        <XCircle size={14} /> Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-gray-800">{batch.name}</h3>
                                                {batch.description && <p className="text-xs text-gray-500 mt-1">📦 {batch.description}</p>}
                                            </div>
                                        )}
                                        <div className="flex gap-1">
                                            {editingBatch !== batch.id && (
                                                <button onClick={() => startEditBatch(batch)} className="p-2 text-blue-500 hover:bg-blue-100 rounded" title="Editar lote">
                                                    <Edit3 size={16} />
                                                </button>
                                            )}
                                            <button onClick={() => setExpandedBatch(isExpanded ? null : batch.id)}
                                                className="p-2 text-gray-500 hover:bg-gray-100 rounded">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                            <button onClick={() => handleDeleteBatch(batch.id, batch.name)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Cards — 2 rows */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
                                    <div className="text-center bg-red-50 p-3 rounded-lg relative group">
                                        <p className="text-xs text-gray-500">💸 Inversión Total</p>
                                        <p className="font-bold text-red-600 text-lg">${parseFloat(batch.total_investment_calculated || batch.total_investment).toLocaleString()}</p>
                                        <button onClick={() => setAddingInvestmentTo(batch.id)}
                                            className="absolute top-1 right-1 text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-pink-100 rounded">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="text-center bg-green-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">💰 Vendido</p>
                                        <p className="font-bold text-green-600 text-lg">${parseFloat(batch.totalRevenue).toLocaleString()}</p>
                                    </div>
                                    <div className="text-center bg-blue-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">📦 En Stock</p>
                                        <p className="font-bold text-blue-600 text-lg">{batch.totalUnitsInStock} uds</p>
                                    </div>
                                    <div className={`text-center p-3 rounded-lg ${isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
                                        <p className="text-xs text-gray-500">{isProfit ? '✅' : '❌'} Ganancia Actual</p>
                                        <p className={`font-bold text-lg flex items-center justify-center gap-1 ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                            {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            ${Math.abs(profit).toLocaleString()} ({batch.profitPercentage}%)
                                        </p>
                                    </div>
                                    <div className="text-center bg-purple-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">🔮 Si vendes TODO</p>
                                        <p className="font-bold text-purple-600 text-lg">${parseFloat(batch.potentialRevenue).toLocaleString()}</p>
                                    </div>
                                    <div className={`text-center p-3 rounded-lg ${projected >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                        <p className="text-xs text-gray-500">🎯 Ganancia Proyectada</p>
                                        <p className={`font-bold text-lg ${projected >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${Math.abs(projected).toLocaleString()} ({batch.projectedProfitPercentage}%)
                                        </p>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="px-4 pb-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Recuperación de inversión</span>
                                        <span>{Math.min(100, Math.round((batch.totalRevenue / parseFloat(batch.total_investment)) * 100))}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${isProfit ? 'bg-green-500' : 'bg-yellow-500'}`}
                                            style={{ width: `${Math.min(100, (batch.totalRevenue / parseFloat(batch.total_investment)) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Expanded: Products Table + Add Product */}
                                {isExpanded && (
                                    <div className="border-t">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 text-gray-600">
                                                <tr>
                                                    <th className="text-left p-3">Producto</th>
                                                    <th className="text-center p-3">Imagen</th>
                                                    <th className="text-center p-3">Precio</th>
                                                    <th className="text-center p-3">Stock</th>
                                                    <th className="text-center p-3">Vendidos</th>
                                                    <th className="text-right p-3">Ingreso</th>
                                                    <th className="text-center p-3">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Add Investment Form */}
                                                {addingInvestmentTo === batch.id && (
                                                    <tr className="bg-pink-50 border-b border-pink-200">
                                                        <td colSpan="7" className="p-4">
                                                            <div className="flex gap-2 items-end">
                                                                <div className="flex-1">
                                                                    <label className="text-xs font-bold text-pink-700">Monto Inversión Adicional</label>
                                                                    <input type="number" value={newInvestment.amount} onChange={e => setNewInvestment({ ...newInvestment, amount: e.target.value })}
                                                                        className="w-full border p-2 rounded" placeholder="Ej: 5000" autoFocus />
                                                                </div>
                                                                <div className="flex-[2]">
                                                                    <label className="text-xs font-bold text-pink-700">Descripción</label>
                                                                    <input type="text" value={newInvestment.description} onChange={e => setNewInvestment({ ...newInvestment, description: e.target.value })}
                                                                        className="w-full border p-2 rounded" placeholder="Ej: Compra extra de bolsas" />
                                                                </div>
                                                                <div className="flex items-center pt-5">
                                                                    <input type="checkbox" id="investFromCash" checked={newInvestment.from_cash}
                                                                        onChange={e => setNewInvestment({ ...newInvestment, from_cash: e.target.checked })} className="mr-1" />
                                                                    <label htmlFor="investFromCash" className="text-xs text-gray-600">De Caja</label>
                                                                </div>
                                                                <button onClick={() => handleAddInvestment(batch.id)} className="bg-pink-600 text-white px-4 py-2 rounded font-bold h-10">Guardar</button>
                                                                <button onClick={() => setAddingInvestmentTo(null)} className="text-gray-500 px-2 h-10">Cancelar</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                                {batch.Products?.map(product => (
                                                    <tr key={product.id} className="border-t">
                                                        {editingProduct === product.id ? (
                                                            <>
                                                                <td className="p-2">
                                                                    <input type="text" value={editProductForm.name}
                                                                        onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                                                                        className="w-full border p-1 rounded text-sm mb-1" />
                                                                    <input type="text" value={editProductForm.image_url}
                                                                        onChange={(e) => setEditProductForm({ ...editProductForm, image_url: e.target.value })}
                                                                        placeholder="URL Imagen" className="w-full border p-1 rounded text-xs text-gray-500" />
                                                                </td>
                                                                <td className="p-2 text-center">
                                                                    {product.image_url && <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded mx-auto" />}
                                                                </td>
                                                                <td className="p-2">
                                                                    <input type="number" value={editProductForm.selling_price}
                                                                        onChange={(e) => setEditProductForm({ ...editProductForm, selling_price: e.target.value })}
                                                                        className="w-20 border p-1 rounded text-sm mx-auto block" />
                                                                </td>
                                                                <td className="p-2">
                                                                    <input type="number" value={editProductForm.current_stock}
                                                                        onChange={(e) => setEditProductForm({ ...editProductForm, current_stock: e.target.value })}
                                                                        className="w-16 border p-1 rounded text-sm mx-auto block" />
                                                                </td>
                                                                <td className="text-center p-2 text-green-600 font-bold">{product.units_sold || 0}</td>
                                                                <td className="text-right p-2">${(product.revenue || 0).toLocaleString()}</td>
                                                                <td className="text-center p-2">
                                                                    <button onClick={() => saveEditProduct(batch.id, product.id)}
                                                                        className="text-green-600 hover:bg-green-100 p-1 rounded"><Save size={14} /></button>
                                                                    <button onClick={() => setEditingProduct(null)}
                                                                        className="text-gray-500 hover:bg-gray-100 p-1 rounded ml-1"><XCircle size={14} /></button>
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="p-3 font-medium flex items-center gap-2">
                                                                    {product.name}
                                                                </td>
                                                                <td className="p-2 text-center">
                                                                    {product.image_url ?
                                                                        <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded mx-auto border" />
                                                                        : <div className="w-10 h-10 bg-gray-100 rounded mx-auto flex items-center justify-center text-xs text-gray-400">IMG</div>
                                                                    }
                                                                </td>
                                                                <td className="text-center p-3">${parseFloat(product.selling_price).toLocaleString()}</td>
                                                                <td className="text-center p-3">{product.current_stock}</td>
                                                                <td className="text-center p-3 text-green-600 font-bold">{product.units_sold || 0}</td>
                                                                <td className="text-right p-3 font-bold">${(product.revenue || 0).toLocaleString()}</td>
                                                                <td className="text-center p-3">
                                                                    <button onClick={() => startEditProduct(product)}
                                                                        className="text-blue-500 hover:bg-blue-100 p-1 rounded"><Edit3 size={14} /></button>
                                                                    <button onClick={() => handleRemoveProduct(batch.id, product.id, product.name)}
                                                                        className="text-red-400 hover:bg-red-100 p-1 rounded ml-1"><Trash2 size={14} /></button>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Add product to batch */}
                                        {addingToBatch === batch.id ? (
                                            <div className="p-3 bg-yellow-50 border-t flex gap-2 items-center">
                                                <input type="text" value={newProduct.name}
                                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                    placeholder="Nombre" className="flex-1 border p-2 rounded text-sm" />
                                                <input type="number" value={newProduct.selling_price}
                                                    onChange={(e) => setNewProduct({ ...newProduct, selling_price: e.target.value })}
                                                    placeholder="Precio" className="w-24 border p-2 rounded text-sm" />
                                                <input type="number" value={newProduct.current_stock}
                                                    onChange={(e) => setNewProduct({ ...newProduct, current_stock: e.target.value })}
                                                    placeholder="Stock" className="w-20 border p-2 rounded text-sm" />
                                                <input type="text" value={newProduct.image_url}
                                                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                                                    placeholder="URL Imagen" className="w-32 border p-2 rounded text-sm" />
                                                <button onClick={() => handleAddProduct(batch.id)}
                                                    className="bg-green-500 text-white px-3 py-2 rounded text-sm font-bold">Agregar</button>
                                                <button onClick={() => setAddingToBatch(null)}
                                                    className="text-gray-500 p-2"><X size={16} /></button>
                                            </div>
                                        ) : (
                                            <div className="p-3 border-t">
                                                <button onClick={() => setAddingToBatch(batch.id)}
                                                    className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1">
                                                    <Plus size={14} /> Agregar producto a este lote
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                                }

                                {/* Expand hint */}
                                {!isExpanded && (
                                    <div className="text-center py-2 border-t">
                                        <button onClick={() => setExpandedBatch(batch.id)}
                                            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto">
                                            <ChevronDown size={14} /> Ver productos y editar
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )
            }
        </div >
    );
};

export default BatchPage;
