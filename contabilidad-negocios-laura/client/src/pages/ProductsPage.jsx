import React, { useState } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

const ProductsPage = () => {
    const [refresh, setRefresh] = useState(0);

    const handleProductAdded = () => {
        setRefresh(prev => prev + 1);
    };

    return (
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
    );
};

export default ProductsPage;
