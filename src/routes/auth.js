const express = require('express');
const router = express.Router();
const { loginValidation, registerValidation, validate } = require('../middleware/validator');
const logger = require('../config/logger');
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', loginValidation, validate, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            logger.error('Erro no login:', error);
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        // Buscar dados adicionais do perfil
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            logger.error('Erro ao buscar perfil:', profileError);
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        logger.info('Login bem-sucedido:', { userId: user.id });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: profile?.name,
                phone: profile?.phone
            }
        });
    } catch (error) {
        logger.error('Erro interno no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro de novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/register', registerValidation, validate, async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        logger.info('Iniciando registro de usuário:', { email, phone });

        // Registrar usuário no Supabase Auth
        logger.debug('Tentando criar usuário no Supabase');
        const { data: { user }, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError) {
            logger.error('Erro no registro Supabase:', authError);
            return res.status(400).json({
                success: false,
                message: authError.message
            });
        }

        logger.info('Usuário criado com sucesso no Supabase:', { userId: user.id });

        // Criar perfil do usuário
        logger.debug('Tentando criar perfil do usuário');
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: user.id,
                    name,
                    phone
                }
            ]);

        if (profileError) {
            logger.error('Erro ao criar perfil:', profileError);
            // Tentar deletar o usuário se falhar ao criar o perfil
            logger.debug('Tentando deletar usuário após falha no perfil');
            await supabase.auth.admin.deleteUser(user.id);
            return res.status(500).json({
                success: false,
                message: 'Erro ao criar perfil do usuário'
            });
        }

        logger.info('Registro completo com sucesso:', { userId: user.id });

        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso'
        });
    } catch (error) {
        logger.error('Erro interno no registro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router; 