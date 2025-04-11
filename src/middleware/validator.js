const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Erro de validação:', { errors: errors.array() });
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Validações comuns
const loginValidation = [
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres')
];

const registerValidation = [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('phone').matches(/^\(\d{2}\) \d{5}-\d{4}$/).withMessage('Telefone inválido'),
    body('password').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres'),
    body('terms').equals('true').withMessage('Você deve aceitar os termos de uso'),
    body('age').equals('true').withMessage('Você deve confirmar que é maior de 18 anos')
];

module.exports = {
    validate,
    loginValidation,
    registerValidation
}; 