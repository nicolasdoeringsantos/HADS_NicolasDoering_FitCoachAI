// Importa o cliente Supabase para interagir com os serviços de autenticação.
import { supabase } from '../supabaseClient.js';

// Middleware 'protect' para proteger rotas que exigem autenticação.
export const protect = async (req, res, next) => {
  // Variável para armazenar o token JWT.
  let token;

  // Verifica se o cabeçalho 'Authorization' existe e começa com 'Bearer '.
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extrai o token do cabeçalho (formato: "Bearer TOKEN").
      token = req.headers.authorization.split(' ')[1];

      // Usa o Supabase para validar o token e obter os dados do usuário.
      const { data: { user }, error } = await supabase.auth.getUser(token);

      // Se o Supabase retornar um erro (token inválido, expirado, etc.), retorna um erro 401 (Não Autorizado).
      if (error) {
        return res.status(401).json({ message: 'Não autorizado, token inválido.', error: error.message });
      }

      // Se o token for válido, anexa o ID do usuário ao objeto 'req' (requisição).
      // Isso torna o ID do usuário acessível nas próximas funções da rota (os controllers).
      req.userId = user.id;

      // Chama a próxima função no ciclo da requisição (o controller da rota).
      next();
    } catch (error) {
      // Se ocorrer qualquer outro erro no processo, retorna 401.
      res.status(401).json({ message: 'Não autorizado, token inválido.', error: error.message });
    }
  } else {
    // Se o cabeçalho 'Authorization' não existir ou não tiver o formato esperado, retorna 401.
    res.status(401).json({ message: 'Não autorizado, token não encontrado.' });
  }
};