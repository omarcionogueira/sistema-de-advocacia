import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Processos from './pages/Processos';
import Pagamentos from './pages/Pagamentos';
import Honorarios from './pages/Honorarios';
import Audiencias from './pages/Audiencias';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container-fluid">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/processos" element={<Processos />} />
            <Route path="/pagamentos" element={<Pagamentos />} />
            <Route path="/honorarios" element={<Honorarios />} />
            <Route path="/audiencias" element={<Audiencias />} />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
