import api from './axios';

export const createExpense = async (data) => {
    const response = await api.post('/accounting/expenses', data);
    return response.data;
};

export const getDailyBalance = async () => {
    const response = await api.get('/accounting/daily-balance');
    return response.data;
};

export const performCashCut = async (data) => {
    const response = await api.post('/accounting/cash-cut', data);
    return response.data;
};

export const downloadReport = () => {
    // Direct link trigger for file download
    window.open('http://localhost:5000/api/accounting/export', '_blank');
};
