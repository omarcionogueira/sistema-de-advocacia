const express = require('express');
const router = express.Router();
const connection = require('../config/database');

// GET - Listar todos os pagamentos
router.get('/', (req, res) => {
  const query = `
    SELECT pag.*, 
           p.numero_processo,
           c.nome as cliente_nome,
           c.email as cliente_email,
           DATE_FORMAT(pag.data_vencimento, '%d/%m/%Y') as data_vencimento_formatada,
           DATE_FORMAT(pag.data_pagamento, '%d/%m/%Y') as data_pagamento_formatada
    FROM pagamentos pag
    LEFT JOIN processos p ON pag.processo_id = p.id
    LEFT JOIN clientes c ON p.cliente_id = c.id
    ORDER BY pag.data_vencimento DESC
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar pagamentos' });
    }
    res.json(results);
  });
});

// GET - Buscar pagamentos por status
router.get('/status/:status', (req, res) => {
  const { status } = req.params;
  const query = `
    SELECT pag.*, 
           p.numero_processo,
           c.nome as cliente_nome
    FROM pagamentos pag
    LEFT JOIN processos p ON pag.processo_id = p.id
    LEFT JOIN clientes c ON p.cliente_id = c.id
    WHERE pag.status = ?
    ORDER BY pag.data_vencimento ASC
  `;
  
  connection.query(query, [status], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar pagamentos' });
    }
    res.json(results);
  });
});

// GET - Buscar pagamentos próximos do vencimento (7 dias)
router.get('/alertas/vencimento', (req, res) => {
  const query = `
    SELECT pag.*, 
           p.numero_processo,
           c.nome as cliente_nome,
           c.email as cliente_email,
           DATEDIFF(pag.data_vencimento, CURDATE()) as dias_para_vencer
    FROM pagamentos pag
    LEFT JOIN processos p ON pag.processo_id = p.id
    LEFT JOIN clientes c ON p.cliente_id = c.id
    WHERE pag.status = 'pendente' 
      AND pag.data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    ORDER BY pag.data_vencimento ASC
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar alertas' });
    }
    res.json(results);
  });
});

// POST - Criar novo pagamento
router.post('/', (req, res) => {
  const { 
    processo_id, 
    descricao, 
    valor, 
    data_vencimento, 
    tipo_pagamento,
    parcela_atual,
    total_parcelas 
  } = req.body;
  
  const query = `
    INSERT INTO pagamentos (processo_id, descricao, valor, data_vencimento, tipo_pagamento, parcela_atual, total_parcelas) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  connection.query(query, [
    processo_id, descricao, valor, data_vencimento, tipo_pagamento, parcela_atual, total_parcelas
  ], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao criar pagamento' });
    }
    res.status(201).json({ 
      id: results.insertId, 
      mensagem: 'Pagamento criado com sucesso' 
    });
  });
});

// POST - Criar múltiplas parcelas (plano de pagamento)
router.post('/parcelas', (req, res) => {
  const { 
    processo_id, 
    descricao, 
    valor_total, 
    data_primeiro_vencimento, 
    numero_parcelas,
    tipo_pagamento 
  } = req.body;
  
  const valor_parcela = valor_total / numero_parcelas;
  const parcelas = [];
  
  for (let i = 0; i < numero_parcelas; i++) {
    const data_vencimento = new Date(data_primeiro_vencimento);
    data_vencimento.setMonth(data_vencimento.getMonth() + i);
    
    parcelas.push([
      processo_id,
      `${descricao} - Parcela ${i + 1}/${numero_parcelas}`,
      valor_parcela,
      data_vencimento.toISOString().split('T')[0],
      tipo_pagamento,
      i + 1,
      numero_parcelas
    ]);
  }
  
  const query = `
    INSERT INTO pagamentos (processo_id, descricao, valor, data_vencimento, tipo_pagamento, parcela_atual, total_parcelas) 
    VALUES ?
  `;
  
  connection.query(query, [parcelas], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao criar parcelas' });
    }
    res.status(201).json({ 
      mensagem: `${numero_parcelas} parcelas criadas com sucesso` 
    });
  });
});

// PUT - Marcar pagamento como pago
router.put('/:id/pagar', (req, res) => {
  const { id } = req.params;
  const { data_pagamento, forma_pagamento } = req.body;
  
  const query = `
    UPDATE pagamentos 
    SET status = 'pago', 
        data_pagamento = ?,
        forma_pagamento = ?,
        data_atualizacao = NOW()
    WHERE id = ?
  `;
  
  connection.query(query, [data_pagamento, forma_pagamento, id], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao atualizar pagamento' });
    }
    res.json({ mensagem: 'Pagamento marcado como pago' });
  });
});

// PUT - Atualizar pagamento
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { descricao, valor, data_vencimento, tipo_pagamento } = req.body;
  
  const query = `
    UPDATE pagamentos 
    SET descricao = ?, valor = ?, data_vencimento = ?, tipo_pagamento = ?
    WHERE id = ?
  `;
  
  connection.query(query, [descricao, valor, data_vencimento, tipo_pagamento, id], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao atualizar pagamento' });
    }
    res.json({ mensagem: 'Pagamento atualizado com sucesso' });
  });
});

module.exports = router;
