import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Pega o token do header 'Authorization: Bearer TOKEN'
      token = req.headers.authorization.split(' ')[1];

      // Verifica o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Adiciona o ID do usuário ao objeto da requisição para ser usado nos controllers
      req.userId = decoded.id;

      next();
    } catch (error) {
      res.status(401).json({ message: 'Não autorizado, token inválido.' });
    }
  } else {
    res.status(401).json({ message: 'Não autorizado, token não encontrado.' });
  }
};