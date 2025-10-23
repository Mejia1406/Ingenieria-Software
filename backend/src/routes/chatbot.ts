import { Router } from 'express';
import { body } from 'express-validator';
import { chatWithBot, getSuggestedQuestions } from '../controllers/chatbotController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Chat con el bot (puede ser con o sin autenticación)
router.post(
  '/chat',
  optionalAuth,
  [
    body('message')
      .isString()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('El mensaje debe tener entre 1 y 1000 caracteres'),
    body('conversationHistory')
      .optional()
      .isArray()
      .withMessage('El historial debe ser un array')
  ],
  validateRequest,
  chatWithBot
);

// Obtener preguntas sugeridas
router.get(
  '/suggestions',
  optionalAuth,
  getSuggestedQuestions
);

export default router;