const express = require('express');
const router = express.Router();
const connection = require('../config/database');

// GET - Listar todos os processos
router.get('/', (req, res) => {
  const query = `
    SELECT p.*, 
           c.nome as cliente_nome,
           c.email as cliente_email,
           c.telefone as cliente_telefone,
           DATE_FORMAT(p.data_abertura, '%d/%m/%Y') as data_abertura_formatada,
           (SELECT COUNT(*) FROM pagamentos WHERE processo_id = p.id) as total_parcelas,
           (SELECT COUNT(*) FROM pagamentos WHERE processo_id = p.id AND status = 'pago') as parcelas_pagas
    FROM processos p 
    LEFT JOIN clientes c ON p.cliente_id = c.id 
    ORDER BY p.data_abertura DESC
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar processos' });
    }
    res.json(results);
  });
});

// POST - Criar novo processo
router.post('/', (req, res) => {
  const { 
    numero_processo, 
    cliente_id, 
    descricao, 
    status, 
    valor_causa, 
    tipo_acao,
    tribunal,
    instancia 
  } = req.body;
  
  const query = `
    INSERT INTO processos (numero_processo, cliente_id, descricao, status, valor_causa, tipo_acao, tribunal, instancia) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  connection.query(query, [
    numero_processo, cliente_id, descricao, status, valor_causa, tipo_acao, tribunal, instancia
  ], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ erro: 'Número de processo já cadastrado' });
      }
      return res.status(500).json({ erro: 'Erro ao criar processo' });
    }
    res.status(201).json({ 
      id: results.insertId, 
      mensagem: 'Processo criado com sucesso' 
    });
  });
});

// PUT - Atualizar processo
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { 
    numero_processo, 
    cliente_id, 
    descricao, 
    status, 
    valor_causa, 
    tipo_acao,
    tribunal,
    instancia 
  } = req.body;
  
  const query = `
    UPDATE processos 
    SET numero_processo = ?, cliente_id = ?, descricao = ?, status = ?, 
        valor_causa = ?, tipo_acao = ?, tribunal = ?, instancia = ?
    WHERE id = ?
  `;
  
  connection.query(query, [
    numero_processo, cliente_id, descricao, status, valor_causa, 
    tipo_acao, tribunal, instancia, id
  ], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao atualizar processo' });
    }
    res.json({ mensagem: 'Processo atualizado com sucesso' });
  });
});

module.exports = router;
