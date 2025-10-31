const cron = require('node-cron');
const connection = require('../config/database');
const nodemailer = require('nodemailer');

// Configuração do email (substitua com suas credenciais)
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Job para verificar pagamentos vencidos (executa diariamente às 8:00)
cron.schedule('0 8 * * *', async () => {
  console.log('🔔 Verificando pagamentos vencidos...');
  
  const query = `
    SELECT pag.*, 
           p.numero_processo,
           c.nome as cliente_nome,
           c.email as cliente_email
    FROM pagamentos pag
    LEFT JOIN processos p ON pag.processo_id = p.id
    LEFT JOIN clientes c ON p.cliente_id = c.id
    WHERE pag.status = 'pendente' 
      AND pag.data_vencimento < CURDATE()
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar pagamentos vencidos:', err);
      return;
    }
    
    results.forEach(pagamento => {
      console.log(`⚠️ Pagamento vencido: ${pagamento.descricao} - Cliente: ${pagamento.cliente_nome}`);
      
      // Enviar email de notificação (opcional)
      if (pagamento.cliente_email) {
        enviarEmailNotificacao(pagamento);
      }
    });
    
    console.log(`📊 ${results.length} pagamentos vencidos encontrados`);
  });
});

// Job para verificar pagamentos próximos do vencimento (executa diariamente às 9:00)
cron.schedule('0 9 * * *', async () => {
  console.log('🔔 Verificando pagamentos próximos do vencimento...');
  
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
      AND pag.data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar pagamentos próximos:', err);
      return;
    }
    
    results.forEach(pagamento => {
      console.log(`🔔 Pagamento próximo: ${pagamento.descricao} - Vence em ${pagamento.dias_para_vencer} dias`);
    });
    
    console.log(`📊 ${results.length} pagamentos próximos do vencimento encontrados`);
  });
});

// Função para enviar email de notificação
function enviarEmailNotificacao(pagamento) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: pagamento.cliente_email,
    subject: `Lembrete de Pagamento - ${pagamento.descricao}`,
    html: `
      <h2>Lembrete de Pagamento</h2>
      <p>Prezado(a) ${pagamento.cliente_nome},</p>
      <p>Informamos que o seguinte pagamento está em aberto:</p>
      <ul>
        <li><strong>Descrição:</strong> ${pagamento.descricao}</li>
        <li><strong>Valor:</strong> R$ ${pagamento.valor.toFixed(2)}</li>
        <li><strong>Vencimento:</strong> ${new Date(pagamento.data_vencimento).toLocaleDateString('pt-BR')}</li>
        <li><strong>Processo:</strong> ${pagamento.numero_processo}</li>
      </ul>
      <p>Por favor, regularize sua situação.</p>
      <p>Atenciosamente,<br>Escritório de Advocacia</p>
    `
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar email:', error);
    } else {
      console.log('Email enviado:', info.response);
    }
  });
}

console.log('✅ Jobs agendados iniciados');
