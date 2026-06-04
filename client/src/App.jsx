import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RegisterMoto from './pages/RegisterMoto';
import AddService from './pages/AddService';
import VehicleHistory from './pages/VehicleHistory';
import QRLookup from './pages/QRLookup';
import RegisterGarage from './pages/RegisterGarage';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register-moto" element={<RegisterMoto />} />
          <Route path="/add-service" element={<AddService />} />
          <Route path="/vehicle/:id" element={<VehicleHistory />} />
          <Route path="/qr-lookup" element={<QRLookup />} />
          <Route path="/lookup/:id" element={<VehicleHistory />} />
          <Route path="/register-garage" element={<RegisterGarage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
