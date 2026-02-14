import api from './axios';

export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const createProduct = async (formData) => {
    const response = await api.post('/products', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateProduct = async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const updateStock = async (id, quantity, type) => {
    const response = await api.put(`/products/${id}/stock`, { quantity, type });
    return response.data;
};
