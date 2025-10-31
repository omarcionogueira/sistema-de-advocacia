import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const Pagamentos = () => {
  const [pagamentos, setPagamentos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFormularioParcelas, setMostrarFormularioParcelas] = useState(false);
  
  const [formData, setFormData] = useState({
    processo_id: '',
    descricao: '',
    valor: '',
    data_vencimento: '',
    tipo_pagamento: 'honorarios'
  });

  const [formParcelas, setFormParcelas] = useState({
    processo_id: '',
    descricao: '',
    valor_total: '',
    data_primeiro_vencimento: '',
    numero_parcelas: 1,
    tipo_pagamento: 'honorarios'
  });

  useEffect(() => {
    carregarPagamentos();
    carregarProcessos();
  }, [filtroStatus]);

  const carregarPagamentos = async () => {
    try {
      const url = filtroStatus === 'todos' 
        ? '/pagamentos' 
        : `/pagamentos/status/${filtroStatus}`;
      
      const response = await api.get(url);
      setPagamentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast.error('Erro ao carregar pagamentos');
    }
  };

  const carregarProcessos = async () => {
    try {
      const response = await api.get('/processos');
      setProcessos(response.data);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleParcelasChange = (e) => {
    const { name, value } = e.target;
    setFormParcelas(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pagamentos', {
        ...formData,
        valor: parseFloat(formData.valor)
      });
      
      toast.success('Pagamento criado com sucesso!');
      setMostrarFormulario(false);
      setFormData({
        processo_id: '',
        descricao: '',
        valor: '',
        data_vencimento: '',
        tipo_pagamento: 'honorarios'
      });
      carregarPagamentos();
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast.error('Erro ao criar pagamento');
    }
  };

  const handleSubmitParcelas = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pagamentos/parcelas', {
        ...formParcelas,
        valor_total: parseFloat(formParcelas.valor_total)
      });
      
      toast.success('Parcelas criadas com sucesso!');
      setMostrarFormularioParcelas(false);
      setFormParcelas({
        processo_id: '',
        descricao: '',
        valor_total: '',
        data_primeiro_vencimento: '',
        numero_parcelas: 1,
        tipo_pagamento: 'honorarios'
      });
      carregarPagamentos();
    } catch (error) {
      console.error('Erro ao criar parcelas:', error);
      toast.error('Erro ao criar parcelas');
    }
  };

  const marcarComoPago = async (pagamentoId) => {
    try {
      await api.put(`/pagamentos/${pagamentoId}/pagar`, {
        data_pagamento: new Date().toISOString().split('T')[0],
        forma_pagamento: 'pix'
      });
      
      toast.success('Pagamento marcado como pago!');
      carregarPagamentos();
    } catch (error) {
      console.error('Erro ao marcar pagamento:', error);
      toast.error('Erro ao marcar pagamento');
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getStatusBadge = (status) => {
    const cores = {
      pendente: 'warning',
      pago: 'success',
      atrasado: 'danger'
    };
    
    return `badge bg-${cores[status] || 'secondary'}`;
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>💰 Gerenciar Pagamentos</h1>
        <div>
          <button 
            className="btn btn-primary me-2"
            onClick={() => setMostrarFormulario(true)}
          >
            Novo Pagamento
          </button>
          <button 
            className="btn btn-success"
            onClick={() => setMostrarFormularioParcelas(true)}
          >
            Criar Parcelas
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Filtrar por Status</label>
              <select 
                className="form-select"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendentes</option>
                <option value="pago">Pagos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Pagamento Único */}
      {mostrarFormulario && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>Novo Pagamento</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Processo</label>
                  <select
                    className="form-select"
                    name="processo_id"
                    value={formData.processo_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione um processo</option>
                    {processos.map(processo => (
                      <option key={processo.id} value={processo.id}>
                        {processo.numero_processo} - {processo.cliente_nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Descrição</label>
                  <input
                    type="text"
                    className="form-control"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="valor"
                    value={formData.valor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Data de Vencimento</label>
                  <input
                    type="date"
                    className="form-control"
                    name="data_vencimento"
                    value={formData.data_vencimento}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Tipo de Pagamento</label>
                  <select
                    className="form-select"
                    name="tipo_pagamento"
                    value={formData.tipo_pagamento}
                    onChange={handleInputChange}
                  >
                    <option value="honorarios">Honorários</option>
                    <option value="custas">Custas Processuais</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>
              
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">
                  Cadastrar
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setMostrarFormulario(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formulário de Parcelas */}
      {mostrarFormularioParcelas && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>Criar Plano de Parcelas</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmitParcelas}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Processo</label>
                  <select
                    className="form-select"
                    name="processo_id"
                    value={formParcelas.processo_id}
                    onChange={handleParcelasChange}
                    required
                  >
                    <option value="">Selecione um processo</option>
                    {processos.map(processo => (
                      <option key={processo.id} value={processo.id}>
                        {processo.numero_processo} - {processo.cliente_nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Descrição</label>
                  <input
                    type="text"
                    className="form-control"
                    name="descricao"
                    value={formParcelas.descricao}
                    onChange={handleParcelasChange}
                    required
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Valor Total</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="valor_total"
                    value={formParcelas.valor_total}
                    onChange={handleParcelasChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Primeiro Vencimento</label>
                  <input
                    type="date"
                    className="form-control"
                    name="data_primeiro_vencimento"
                    value={formParcelas.data_primeiro_vencimento}
                    onChange={handleParcelasChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Número de Parcelas</label>
                  <input
                    type="number"
                    className="form-control"
                    name="numero_parcelas"
                    value={formParcelas.numero_parcelas}
                    onChange={handleParcelasChange}
                    min="1"
                    max="36"
                    required
                  />
                </div>
              </div>
              
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">
                  Criar Parcelas
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setMostrarFormularioParcelas(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Pagamentos */}
      <div className="card">
        <div className="card-header">
          <h5>Lista de Pagamentos</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Cliente</th>
                  <th>Processo</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.map(pagamento => (
                  <tr key={pagamento.id}>
                    <td>{pagamento.descricao}</td>
                    <td>{pagamento.cliente_nome}</td>
                    <td>{pagamento.numero_processo}</td>
                    <td>{formatarMoeda(pagamento.valor)}</td>
                    <td>{pagamento.data_vencimento_formatada}</td>
                    <td>
                      <span className={getStatusBadge(pagamento.status)}>
                        {pagamento.status}
                      </span>
                    </td>
                    <td>
                      {pagamento.status === 'pendente' && (
                        <button 
                          className="btn btn-sm btn-success me-2"
                          onClick={() => marcarComoPago(pagamento.id)}
                        >
                          Marcar como Pago
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagamentos;
