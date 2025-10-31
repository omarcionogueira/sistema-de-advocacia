const express = require('express');
const router = express.Router();
const connection = require('../config/database');

// GET - Listar todos os clientes
router.get('/', (req, res) => {
  const query = `
    SELECT *, 
           DATE_FORMAT(data_cadastro, '%d/%m/%Y %H:%i') as data_cadastro_formatada
    FROM clientes 
    ORDER BY data_cadastro DESC
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar clientes' });
    }
    res.json(results);
  });
});

// GET - Buscar cliente por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM clientes WHERE id = ?';
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar cliente' });
    }
    if (results.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    res.json(results[0]);
  });
});

// POST - Criar novo cliente
router.post('/', (req, res) => {
  const { nome, cpf, telefone, email, endereco, observacoes } = req.body;
  
  const query = `
    INSERT INTO clientes (nome, cpf, telefone, email, endereco, observacoes) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  connection.query(query, [nome, cpf, telefone, email, endereco, observacoes], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ erro: 'CPF já cadastrado' });
      }
      return res.status(500).json({ erro: 'Erro ao criar cliente' });
    }
    res.status(201).json({ 
      id: results.insertId, 
      mensagem: 'Cliente criado com sucesso' 
    });
  });
});

// PUT - Atualizar cliente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, cpf, telefone, email, endereco, observacoes } = req.body;
  
  const query = `
    UPDATE clientes 
    SET nome = ?, cpf = ?, telefone = ?, email = ?, endereco = ?, observacoes = ?
    WHERE id = ?
  `;
  
  connection.query(query, [nome, cpf, telefone, email, endereco, observacoes, id], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao atualizar cliente' });
    }
    res.json({ mensagem: 'Cliente atualizado com sucesso' });
  });
});

// DELETE - Excluir cliente
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM clientes WHERE id = ?';
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao excluir cliente' });
    }
    res.json({ mensagem: 'Cliente excluído com sucesso' });
  });
});

module.exports = router;
