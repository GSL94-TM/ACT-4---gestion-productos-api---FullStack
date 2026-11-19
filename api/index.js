require('dotenv').config();
const app = require('../app');
const connectDB = require('../config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Error al conectar a MongoDB en Vercel:', error.message);
    return res.status(500).json({ error: 'Error de conexión con la base de datos.' });
  }
};