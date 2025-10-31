const express = require('express');
const router = express.Router();
const connection = require('../config/database');

// GET - Listar todos os honorários
router.get('/', (req, res) => {
  const query = `
    SELECT h.*, 
           p.numero_processo,
           c.nome as cliente_nome,
           DATE_FORMAT(h.data_lancamento, '%d/%m/%Y') as data_lancamento_formatada
    FROM honorarios h
    LEFT JOIN processos p ON h.processo_id = p.id
    LEFT JOIN clientes c ON p.cliente_id = c.id
    ORDER BY h.data_lancamento DESC
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar honorários' });
    }
    res.json(results);
  });
});

// POST - Lançar honorário
router.post('/', (req, res) => {
  const { 
    processo_id, 
    descricao, 
    valor, 
    tipo_honorario,
    data_lancamento 
  } = req.body;
  
  const query = `
    INSERT INTO honorarios (processo_id, descricao, valor, tipo_honorario, data_lancamento) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  connection.query(query, [
    processo_id, descricao, valor, tipo_honorario, data_lancamento
  ], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao lançar honorário' });
    }
    res.status(201).json({ 
      id: results.insertId, 
      mensagem: 'Honorário lançado com sucesso' 
    });
  });
});

module.exports = router;
