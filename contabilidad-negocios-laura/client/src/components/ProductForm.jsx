import React, { useState } from 'react';
import { createProduct } from '../api/products';
import { Plus, Image as ImageIcon } from 'lucide-react';

const ProductForm = ({ onProductAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        cost_price: '',
        selling_price: '',
        current_stock: '',
        min_stock_alert: 5
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (image) data.append('image', image);

            await createProduct(data);
            alert('Producto agregado con éxito');
            setFormData({
                name: '',
                cost_price: '',
                selling_price: '',
                current_stock: '',
                min_stock_alert: 5
            });
            setImage(null);
            setPreview(null);
            if (onProductAdded) onProductAdded();
        } catch (error) {
            alert('Error al agregar producto');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-pink-600">
                <Plus size={24} /> Agregar Nuevo Producto
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div className="flex justify-center mb-4">
                    <label className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 transition">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <div className="text-gray-400 text-center">
                                <ImageIcon size={32} className="mx-auto mb-1" />
                                <span className="text-xs">Foto</span>
                            </div>
                        )}
                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Costo (Inversión)</label>
                        <input
                            type="number"
                            name="cost_price"
                            value={formData.cost_price}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Precio Venta</label>
                        <input
                            type="number"
                            name="selling_price"
                            value={formData.selling_price}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stock Inicial</label>
                        <input
                            type="number"
                            name="current_stock"
                            value={formData.current_stock}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Alerta Mínima</label>
                        <input
                            type="number"
                            name="min_stock_alert"
                            value={formData.min_stock_alert}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                    {loading ? 'Guardando...' : 'Guardar Producto'}
                </button>
            </form>
        </div>
    );
};

export default ProductForm;
