// Importa o framework Express para criar o roteador.
import express from 'express';
// Importa as funções de controller que lidam com a lógica da IA.
import { generateChatResponse, getDailyMessage } from '../controllers/aiController.js';
// Importa o middleware de autenticação para proteger as rotas.
import { protect } from '../middleware/authMiddleware.js';

// Cria uma nova instância do roteador do Express.
const router = express.Router();

// Define a rota POST para '/chat'. A rota é protegida pelo middleware 'protect'.
// Quando uma requisição chega, 'protect' é executado primeiro. Se a autenticação for bem-sucedida, 'generateChatResponse' é chamado.
router.post('/chat', protect, generateChatResponse);
// Define a rota GET para '/daily-message', também protegida por autenticação.
router.get('/daily-message', protect, getDailyMessage);

// Exporta o roteador para ser usado no arquivo principal do servidor (index.js).
export default router;