import api from './axios';

export const createSale = async (items) => {
    // Calculate total on client side for safety double check, but backend does main logic
    const total = items.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);

    const response = await api.post('/sales', {
        items: items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            selling_price: item.selling_price
        })),
        total
    });
    return response.data;
};

export const getSaleById = async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
};
