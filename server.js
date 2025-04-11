require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const logger = require('./src/config/logger');
const swaggerSpecs = require('./src/config/swagger');
const authRoutes = require('./src/routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Permitir todas as origens durante desenvolvimento
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Adicionar suporte para form-data
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '.')));

// Documentação da API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    logger.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'sua-chave-secreta', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Simulação de banco de dados (em produção, use um banco de dados real)
const users = [];

// Rotas de API
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        console.log('Dados recebidos:', { name, email, phone });

        // Verificar se o usuário já existe
        if (users.find(user => user.email === email)) {
            return res.status(400).json({ message: 'E-mail já cadastrado' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar novo usuário
        const user = {
            id: users.length + 1,
            name,
            email,
            phone,
            password: hashedPassword
        };

        users.push(user);
        console.log('Usuário cadastrado:', user);

        res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Tentativa de login:', email);

        // Encontrar usuário
        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Verificar senha
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'sua-chave-secreta',
            { expiresIn: '24h' }
        );

        console.log('Login bem-sucedido:', user.email);

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota protegida de exemplo
app.get('/api/user-info', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
    });
});

// Rotas de páginas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'indexloguin.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Rotas da API
app.use('/api/auth', authRoutes);

// Tratamento de rotas não encontradas
app.use((req, res) => {
    logger.warn('Rota não encontrada:', req.originalUrl);
    res.status(404).sendFile(path.join(__dirname, 'indexloguin.html'));
});

// Função para tentar iniciar o servidor em uma porta específica
const startServer = (port) => {
    try {
        app.listen(port, () => {
            logger.info(`Servidor rodando na porta ${port}`);
            logger.info(`Documentação da API disponível em: http://localhost:${port}/api-docs`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger.warn(`Porta ${port} em uso, tentando próxima porta...`);
                startServer(port + 1);
            } else {
                logger.error('Erro ao iniciar servidor:', err);
            }
        });
    } catch (error) {
        logger.error('Erro ao iniciar servidor:', error);
    }
};

// Iniciar o servidor
startServer(PORT); 