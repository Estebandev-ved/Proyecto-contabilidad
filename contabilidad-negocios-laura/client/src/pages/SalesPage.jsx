import React, { useState, useEffect } from 'react';
import { getProducts } from '../api/products'; // We will need to create sales api soon
import { createSale } from '../api/sales';
import { ShoppingCart, Trash, Plus, Minus } from 'lucide-react';

const SalesPage = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

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

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const total = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);

    // ...
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        try {
            await createSale(cart);
            alert('¡Venta registrada con éxito!');
            setCart([]);
            fetchProducts(); // Refresh stock
        } catch (error) {
            console.error(error);
            alert('Error al registrar la venta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4">
            {/* Products Grid */}
            <div className="lg:w-2/3 overflow-y-auto pr-2">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Punto de Venta</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map(product => (
                        <div
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="bg-white p-3 rounded-lg shadow cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-pink-400 transition"
                        >
                            <div className="h-32 bg-gray-100 rounded mb-2 overflow-hidden">
                                {product.image_url ? (
                                    <img src={`http://localhost:5000${product.image_url}`} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">Sin Foto</div>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm truncate">{product.name}</h3>
                            <p className="text-pink-600 font-bold">${product.selling_price}</p>
                            <div className={`text-xs mt-1 ${product.current_stock < 5 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                Stock: {product.current_stock}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="lg:w-1/3 bg-white rounded-lg shadow-xl flex flex-col h-full border-l">
                <div className="p-4 bg-gray-50 border-b">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-700">
                        <ShoppingCart size={24} /> Carrito de Venta
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center border-b pb-2">
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm">{item.name}</h4>
                                <div className="text-gray-500 text-xs">${item.selling_price} x {item.quantity}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-200 rounded"><Minus size={14} /></button>
                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-200 rounded"><Plus size={14} /></button>
                                <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded ml-1"><Trash size={16} /></button>
                            </div>
                            <div className="text-right font-bold w-16 ml-2">
                                ${(item.selling_price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="text-center text-gray-400 mt-10">
                            Carrito vacío. <br /> Selecciona productos para vender.
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50 border-t">
                    <div className="flex justify-between items-center mb-4 text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-pink-600">${total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition text-lg"
                    >
                        Cobrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesPage;
