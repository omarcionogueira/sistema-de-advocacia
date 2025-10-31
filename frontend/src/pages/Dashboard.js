import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [estatisticas, setEstatisticas] = useState({
    totalClientes: 0,
    totalProcessos: 0,
    processosAtivos: 0,
    audienciasHoje: 0,
    pagamentosPendentes: 0,
    pagamentosMes: 0,
    honorariosMes: 0
  });

  const [proximosVencimentos, setProximosVencimentos] = useState([]);

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    try {
      const [estatisticasRes, vencimentosRes] = await Promise.all([
        api.get('/dashboard/estatisticas'),
        api.get('/dashboard/proximos-vencimentos')
      ]);
      
      setEstatisticas(estatisticasRes.data);
      setProximosVencimentos(vencimentosRes.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Dashboard</h1>
      
      {/* Cards de Estatísticas */}
      <div className="row">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Clientes
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {estatisticas.totalClientes}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-users fa-2x text-gray-300">👥</i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Processos Ativos
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {estatisticas.processosAtivos}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-folder fa-2x text-gray-300">📁</i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Pagamentos Pendentes
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {estatisticas.pagamentosPendentes}
                  </div>
                </div>
                <div className="col-auto">
                  <i className
