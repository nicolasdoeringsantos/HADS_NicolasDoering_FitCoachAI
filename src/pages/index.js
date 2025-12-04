// Importa as bibliotecas necessárias.
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Importa as rotas de autenticação definidas em outro arquivo.
import authRoutes from './routes/authRoutes.js';

// Carrega as variáveis de ambiente do arquivo .env localizado na pasta raiz do frontend.
dotenv.config({ path: '../.env' });

// Cria uma instância do aplicativo Express.
const app = express();
// Define a porta do servidor, usando a variável de ambiente PORT ou 5000 como padrão.
const PORT = process.env.PORT || 5000;

// Habilita o CORS (Cross-Origin Resource Sharing) para permitir que o frontend
// (rodando em uma porta diferente) faça requisições para este servidor.
app.use(cors());
// Habilita o parsing de JSON no corpo das requisições.
app.use(express.json());

// Monta as rotas de autenticação no caminho '/api/auth'.
// Todas as rotas definidas em `authRoutes` serão prefixadas com '/api/auth'.
app.use('/api/auth', authRoutes);

// Inicia o servidor e o faz escutar na porta definida.
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});