import React, { useEffect, useState } from 'react';
import { getProducts, deleteProduct, updateProduct } from '../api/products';
import { Edit, Trash2, AlertTriangle, X, Save } from 'lucide-react';

const ProductList = ({ refreshTrigger }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [refreshTrigger]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
        try {
            await deleteProduct(id);
            fetchProducts();
        } catch (error) {
            alert('Error al eliminar producto');
        }
    };

    const startEditing = (product) => {
        setEditingId(product.id);
        setEditForm({
            name: product.name,
            cost_price: product.cost_price,
            selling_price: product.selling_price,
            current_stock: product.current_stock,
            min_stock_alert: product.min_stock_alert
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSaveEdit = async (id) => {
        try {
            const data = new FormData();
            Object.keys(editForm).forEach(key => data.append(key, editForm[key]));
            await updateProduct(id, data);
            setEditingId(null);
            fetchProducts();
        } catch (error) {
            alert('Error al actualizar producto');
        }
    };

    if (loading) return <div className="text-center p-4">Cargando inventario...</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-200 relative">
                        {product.image_url ? (
                            <img
                                src={`http://localhost:5000${product.image_url}`}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Sin Imagen
                            </div>
                        )}
                        {product.current_stock <= product.min_stock_alert && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <AlertTriangle size={12} /> Stock Bajo
                            </div>
                        )}
                    </div>

                    <div className="p-4">
                        {editingId === product.id ? (
                            /* EDIT MODE */
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full border p-1 rounded text-sm font-bold"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-500">Costo</label>
                                        <input
                                            type="number"
                                            value={editForm.cost_price}
                                            onChange={(e) => setEditForm({ ...editForm, cost_price: e.target.value })}
                                            className="w-full border p-1 rounded text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Precio</label>
                                        <input
                                            type="number"
                                            value={editForm.selling_price}
                                            onChange={(e) => setEditForm({ ...editForm, selling_price: e.target.value })}
                                            className="w-full border p-1 rounded text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-500">Stock</label>
                                        <input
                                            type="number"
                                            value={editForm.current_stock}
                                            onChange={(e) => setEditForm({ ...editForm, current_stock: e.target.value })}
                                            className="w-full border p-1 rounded text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Alerta Min.</label>
                                        <input
                                            type="number"
                                            value={editForm.min_stock_alert}
                                            onChange={(e) => setEditForm({ ...editForm, min_stock_alert: e.target.value })}
                                            className="w-full border p-1 rounded text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => handleSaveEdit(product.id)}
                                        className="flex-1 flex items-center justify-center gap-1 p-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                    >
                                        <Save size={14} /> Guardar
                                    </button>
                                    <button
                                        onClick={cancelEditing}
                                        className="flex-1 flex items-center justify-center gap-1 p-2 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                                    >
                                        <X size={14} /> Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* VIEW MODE */
                            <>
                                <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <span className="text-xs text-gray-500 block">Costo</span>
                                        <span className="text-gray-600 text-sm">${product.cost_price}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Precio</span>
                                        <span className="font-bold text-green-600 text-lg">${product.selling_price}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-500 block">Stock</span>
                                        <span className={`font-bold text-lg ${product.current_stock <= 5 ? 'text-red-600' : 'text-blue-600'}`}>
                                            {product.current_stock}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 mb-2">
                                    Ganancia: <span className="text-green-600 font-bold">${(product.selling_price - product.cost_price).toFixed(2)}</span> por unidad
                                </div>
                                <div className="flex justify-end gap-2 mt-2 border-t pt-2">
                                    <button
                                        onClick={() => startEditing(product)}
                                        className="flex items-center gap-1 p-2 text-blue-600 hover:bg-blue-50 rounded transition text-sm"
                                    >
                                        <Edit size={16} /> Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id, product.name)}
                                        className="flex items-center gap-1 p-2 text-red-600 hover:bg-red-50 rounded transition text-sm"
                                    >
                                        <Trash2 size={16} /> Eliminar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ))}

            {products.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500">
                    No hay productos registrados aún.
                </div>
            )}
        </div>
    );
};

export default ProductList;
