import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductForm from './components/ProductForm';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import AccountingPage from './pages/AccountingPage';
import DailyLoadPage from './pages/DailyLoadPage';
import BatchPage from './pages/BatchPage';
import { ShoppingCart, Package, DollarSign, Truck, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm p-4 mb-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-pink-600">Contabilidad Laura</h1>
            <div className="flex gap-1 flex-wrap">
              <Link to="/productos" className="flex items-center gap-1 text-gray-600 hover:text-pink-600 px-2 py-2 rounded-md hover:bg-pink-50 text-sm">
                <Package size={16} /> Inventario
              </Link>
              <Link to="/lotes" className="flex items-center gap-1 text-gray-600 hover:text-pink-600 px-2 py-2 rounded-md hover:bg-pink-50 text-sm">
                <Layers size={16} /> Inversiones
              </Link>
              <Link to="/carga" className="flex items-center gap-1 text-gray-600 hover:text-pink-600 px-2 py-2 rounded-md hover:bg-pink-50 text-sm">
                <Truck size={16} /> Carga del Día
              </Link>
              <Link to="/ventas" className="flex items-center gap-1 text-gray-600 hover:text-pink-600 px-2 py-2 rounded-md hover:bg-pink-50 text-sm">
                <ShoppingCart size={16} /> Vender
              </Link>
              <Link to="/finanzas" className="flex items-center gap-1 text-gray-600 hover:text-pink-600 px-2 py-2 rounded-md hover:bg-pink-50 text-sm">
                <DollarSign size={16} /> Finanzas
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/lotes" element={<BatchPage />} />
            <Route path="/carga" element={<DailyLoadPage />} />
            <Route path="/ventas" element={<SalesPage />} />
            <Route path="/finanzas" element={<AccountingPage />} />
            <Route path="/" element={
              <div className="text-center p-10">
                <h2 className="text-3xl font-bold text-gray-800">Bienvenido</h2>
                <p className="mt-4">Selecciona una opción del menú para comenzar.</p>
                <a href="/carga" className="mt-4 inline-block text-pink-600 hover:underline">Preparar Carga del Día →</a>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

