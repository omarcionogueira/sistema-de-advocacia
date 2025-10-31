CREATE DATABASE IF NOT EXISTS sistema_advocacia_completo;
USE sistema_advocacia_completo;

-- Tabela de clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    observacoes TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de processos
CREATE TABLE processos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_processo VARCHAR(100) UNIQUE NOT NULL,
    cliente_id INT,
    descricao TEXT,
    status ENUM('ativo', 'arquivado', 'concluido') DEFAULT 'ativo',
    valor_causa DECIMAL(15,2),
    tipo_acao VARCHAR(100),
    tribunal VARCHAR(100),
    instancia VARCHAR(50),
    data_abertura DATE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

-- Tabela de pagamentos
CREATE TABLE pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    processo_id INT,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status ENUM('pendente', 'pago', 'atrasado') DEFAULT 'pendente',
    tipo_pagamento ENUM('honorarios', 'custas', 'outros') DEFAULT 'honorarios',
    forma_pagamento VARCHAR(50),
    parcela_atual INT DEFAULT 1,
    total_parcelas INT DEFAULT 1,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE CASCADE
);

-- Tabela de honorários
CREATE TABLE honorarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    processo_id INT,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    tipo_honorario ENUM('contrato', 'successao', 'outros') DEFAULT 'contrato',
    data_lancamento DATE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE CASCADE
);

-- Tabela de audiências
CREATE TABLE audiencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    processo_id INT,
    data_audiencia DATETIME NOT NULL,
    local VARCHAR(255),
    descricao TEXT,
    status ENUM('agendada', 'realizada', 'cancelada') DEFAULT 'agendada',
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE CASCADE
);

-- Tabela de usuários (advogados)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('advogado', 'admin') DEFAULT 'advogado',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário admin padrão
INSERT INTO usuarios (nome, email, senha, tipo) 
VALUES ('Administrador', 'admin@advocacia.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Índices para melhor performance
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_pagamentos_vencimento ON pagamentos(data_vencimento);
CREATE INDEX idx_processos_cliente ON processos(cliente_id);
CREATE INDEX idx_audiencias_data ON audiencias(data_audiencia);
