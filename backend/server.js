const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Importar e executar jobs agendados
require('./src/services/cronJobs');

// Rotas
app.use('/api/clientes', require('./src/routes/clientes'));
app.use('/api/processos', require('./src/routes/processos'));
app.use('/api/audiencias', require('./src/routes/audiencias'));
app.use('/api/pagamentos', require('./src/routes/pagamentos'));
app.use('/api/honorarios', require('./src/routes/honorarios'));
app.use('/api/usuarios', require('./src/routes/usuarios'));
app.use('/api/dashboard', require('./src/routes/dashboard'));

// Rota de saúde da API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    mensagem: 'Sistema de Advocacia API',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Sistema de Gestão para Advogados`);
});
