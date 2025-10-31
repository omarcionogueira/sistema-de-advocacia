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
                  <i className="fas fa-exclamation-triangle fa-2x text-gray-300">⚠️</i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Receita do Mês
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {formatarMoeda(estatisticas.pagamentosMes)}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-dollar-sign fa-2x text-gray-300">💰</i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Próximos Vencimentos */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-warning text-dark">
              <h6 className="m-0 font-weight-bold">⏰ Próximos Vencimentos</h6>
            </div>
            <div className="card-body">
              {proximosVencimentos.length === 0 ? (
                <p className="text-muted">Nenhum vencimento próximo</p>
              ) : (
                <div className="list-group">
                  {proximosVencimentos.map(pagamento => (
                    <div key={pagamento.id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{pagamento.descricao}</h6>
                        <small className={`badge ${pagamento.dias_para_vencer <= 3 ? 'bg-danger' : 'bg-warning'}`}>
                          {pagamento.dias_para_vencer} dias
                        </small>
                      </div>
                      <p className="mb-1">
                        <strong>Cliente:</strong> {pagamento.cliente_nome}<br/>
                        <strong>Valor:</strong> {formatarMoeda(pagamento.valor)}<br/>
                        <strong>Vencimento:</strong> {pagamento.data_vencimento_formatada}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h6 className="m-0 font-weight-bold">🚀 Ações Rápidas</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/clientes" className="btn btn-outline-primary btn-block">
                  👥 Gerenciar Clientes
                </Link>
                <Link to="/processos" className="btn btn-outline-success btn-block">
                  📁 Gerenciar Processos
                </Link>
                <Link to="/pagamentos" className="btn btn-outline-warning btn-block">
                  💰 Gerenciar Pagamentos
                </Link>
                <Link to="/audiencias" className="btn btn-outline-info btn-block">
                  🗓️ Agendar Audiência
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
