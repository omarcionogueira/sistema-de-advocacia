const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_advocacia_completo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar conexão
connection.getConnection((err, conn) => {
  if (err) {
    console.error('❌ Erro ao conectar com o banco de dados:', err);
    return;
  }
  console.log('✅ Conectado ao banco de dados MySQL');
  conn.release();
});

module.exports = connection;
