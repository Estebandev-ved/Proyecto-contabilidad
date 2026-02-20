import api from './axios';

export const createExpense = async (data) => {
    const response = await api.post('/accounting/expenses', data);
    return response.data;
};

export const getDailyBalance = async () => {
    const response = await api.get('/accounting/daily-balance');
    return response.data;
};

export const getGlobalBalance = async () => {
    const response = await api.get('/accounting/global-balance');
    return response.data;
};

export const performCashCut = async (data) => {
    const response = await api.post('/accounting/cash-cut', data);
    return response.data;
};

export const downloadReport = () => {
    window.open('http://localhost:5000/api/accounting/export', '_blank');
};

export const getProfitReport = async (startDate, endDate) => {
    const response = await api.get('/accounting/profit-report', { params: { startDate, endDate } });
    return response.data;
};

export const getProductStats = async (startDate, endDate) => {
    const response = await api.get('/accounting/product-stats', { params: { startDate, endDate } });
    return response.data;
};
