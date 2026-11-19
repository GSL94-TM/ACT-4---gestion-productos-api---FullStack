const notFound = (req, res, next) => {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
};

const errorHandler = (err, req, res, next) => {
  //Error de JSON mal formado en el cuerpo de la petición
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Estructura JSON inválida en la solicitud.' });
  }

  //Error de ID inválido en MongoDB/Mongoose
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'El ID proporcionado no es válido.' });
  }

  //Error de validación de esquema de Mongoose
  if (err.name === 'ValidationError') {
    const detalles = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Datos inválidos.', detalles });
  }

  //Error de clave duplicada en MongoDB (ej. correo ya registrado)
  if (err.code === 11000) {
    return res.status(400).json({ error: 'Ya existe un registro con ese valor.' });
  }

  console.error('Error interno:', err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Error interno del servidor.'
  });
};

module.exports = { notFound, errorHandler };