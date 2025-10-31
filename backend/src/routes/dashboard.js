const express = require('express');
const router = express.Router();
const connection = require('../config/database');

// GET - Estatísticas do dashboard
router.get('/estatisticas', (req, res) => {
  const queries = {
    totalClientes: 'SELECT COUNT(*) as total FROM clientes',
    totalProcessos: 'SELECT COUNT(*) as total FROM processos',
    processosAtivos: 'SELECT COUNT(*) as total FROM processos WHERE status = "ativo"',
    audienciasHoje: `SELECT COUNT(*) as total FROM audiencias WHERE DATE(data_audiencia) = CURDATE()`,
    pagamentosPendentes: `SELECT COUNT(*) as total FROM pagamentos WHERE status = "pendente" AND data_vencimento <= CURDATE()`,
    pagamentosMes: `SELECT SUM(valor) as total FROM pagamentos WHERE status = "pago" AND MONTH(data_pagamento) = MONTH(CURDATE()) AND YEAR(data_pagamento) = YEAR(CURDATE())`,
    honorariosMes: `SELECT SUM(valor) as total FROM honorarios WHERE MONTH(data_lancamento) = MONTH(CURDATE()) AND YEAR(data_lancamento) = YEAR(CURDATE())`
  };

  const resultados = {};
  let queriesExecutadas = 0;
  const totalQueries = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    connection.query(queries[key], (err, results) => {
      if (err) {
        resultados[key] = 0;
      } else {
        resultados[key] = results[0].total || 0;
      }
      
      queriesExecutadas++;
      if (queriesExecutadas === totalQueries) {
        res.json(resultados);
      }
    });
  });
});

// GET - Próximos vencimentos
router.get('/proximos-vencimentos', (req, res) => {
  const query = `
    SELECT pag.*, 
           p.numero_processo,
           c.nome as cliente_nome,
           DATEDIFF(pag.data_vencimento, CURDATE()) as dias_para_vencer
    FROM pagamentos pag
    LEFT JOIN processos p ON pag.processo_id = p.id
    LEFT JOIN clientes c ON p.cliente_id = c.id
    WHERE pag.status = 'pendente' 
      AND pag.data_vencimento >= CURDATE()
    ORDER BY pag.data_vencimento ASC
    LIMIT 10
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar vencimentos' });
    }
    res.json(results);
  });
});

module.exports = router;
