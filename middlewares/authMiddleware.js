const jwt = require('jsonwebtoken');

//Almacén en memoria para tokens revocados al cerrar sesión
const revokedTokens = new Set();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Acceso denegado. Token no proporcionado o formato inválido.'
    });
  }

  const token = authHeader.split(' ')[1];

  if (revokedTokens.has(token)) {
    return res.status(401).json({
      error: 'La sesión fue cerrada. Inicie sesión nuevamente.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado.'
    });
  }
};

const revokeToken = (token) => {
  if (token) {
    revokedTokens.add(token);
  }
};

module.exports = { verifyToken, revokeToken };