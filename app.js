const express = require('express');
const cors = require('cors');
const path = require('path');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

//Middlewares globales para manejo de solicitudes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (para la vista HTML de login en public/)
app.use(express.static(path.join(__dirname, 'public')));

//Redirige la raíz a la vista estática de login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ruta de verificación de estado del servidor
app.get('/api/health', (req, res) => {
  res.status(200).json({
    estado: 'OK',
    mensaje: 'API de Gestión de Productos funcionando correctamente.'
  });
});

// Rutas de recursos de la aplicación
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Middlewares de manejo de rutas inexistentes y errores globales
app.use(notFound);
app.use(errorHandler);

module.exports = app;