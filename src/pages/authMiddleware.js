import { supabase } from '../supabaseClient.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verifica o token com o Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error) {
        return res.status(401).json({ message: 'Não autorizado, token inválido.', error: error.message });
      }

      // Adiciona o ID do usuário ao objeto da requisição
      req.userId = user.id;

      next();
    } catch (error) {
      res.status(401).json({ message: 'Não autorizado, token inválido.', error: error.message });
    }
  } else {
    res.status(401).json({ message: 'Não autorizado, token não encontrado.' });
  }
};