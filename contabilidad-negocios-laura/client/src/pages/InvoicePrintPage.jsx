import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSaleById } from '../api/sales';
import { Printer } from 'lucide-react';

const InvoicePrintPage = () => {
    const { id } = useParams();
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSale = async () => {
            try {
                const data = await getSaleById(id);
                setSale(data);
            } catch (error) {
                console.error('Error fetching sale:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSale();
    }, [id]);

    if (loading) return <div className="p-10 text-center">Cargando recibo...</div>;
    if (!sale) return <div className="p-10 text-center text-red-500">Recibo no encontrado</div>;

    return (
        <div className="bg-gray-100 min-h-screen py-8 print:bg-white print:p-0">
            <div className="max-w-md mx-auto bg-white p-8 shadow-lg print:shadow-none print:max-w-none">

                {/* Header */}
                <div className="text-center border-b pb-4 mb-4">
                    <h1 className="text-2xl font-bold uppercase tracking-wider">Contabilidad Laura</h1>
                    <p className="text-sm text-gray-500">NIT: 12345678-9</p>
                    <p className="text-sm text-gray-500">Dirección del Negocio, Ciudad</p>
                    <p className="text-sm text-gray-500">Tel: (555) 123-4567</p>
                </div>

                {/* Meta info */}
                <div className="flex justify-between text-sm mb-6">
                    <div>
                        <p className="font-bold">Recibo de Venta</p>
                        <p>#{sale.id}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">Fecha</p>
                        <p>{new Date(sale.date || sale.createdAt).toLocaleString()}</p>
                    </div>
                </div>

                {/* Items */}
                <table className="w-full text-sm mb-6">
                    <thead>
                        <tr className="border-b-2 border-gray-300">
                            <th className="text-left py-2">Cant</th>
                            <th className="text-left py-2">Desc</th>
                            <th className="text-right py-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sale.SaleItems?.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100">
                                <td className="py-2">{item.quantity}</td>
                                <td className="py-2">{item.Product?.name || 'Producto'}</td>
                                <td className="py-2 text-right">
                                    ${parseFloat(item.total).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total */}
                <div className="flex justify-between items-center text-xl font-bold border-t-2 border-gray-800 pt-2 mb-8">
                    <span>Total a Pagar:</span>
                    <span>${parseFloat(sale.amount).toLocaleString()}</span>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t">
                    <p>¡Gracias por su compra!</p>
                    <p>Vuelva pronto.</p>
                </div>

                {/* Print Action */}
                <div className="mt-8 text-center print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 mx-auto"
                    >
                        <Printer size={20} /> Imprimir Recibo
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                        Si usas impresora térmica, ajusta el tamaño de papel en las opciones de impresión.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default InvoicePrintPage;
