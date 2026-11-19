const mongoose = require('mongoose');

//Valida que el parámetro ID tenga un formato válido de ObjectId de MongoDB
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: 'El ID del producto proporcionado no tiene un formato válido.'
    });
  }
  next();
};

//Valida los datos al crear o actualizar un producto
const validateProductData = (req, res, next) => {
  const { nombre, precio, stock } = req.body;
  const isPost = req.method === 'POST';

  if (isPost) {
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
      return res.status(400).json({
        error: 'El campo "nombre" es obligatorio y debe tener al menos 2 caracteres.'
      });
    }
    if (precio === undefined || typeof precio !== 'number' || precio < 0) {
      return res.status(400).json({
        error: 'El campo "precio" es obligatorio y debe ser un número mayor o igual a 0.'
      });
    }
  } else {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Debes enviar al menos un campo para actualizar el producto.'
      });
    }
    if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim().length < 2)) {
      return res.status(400).json({
        error: 'El campo "nombre" debe ser un texto de al menos 2 caracteres.'
      });
    }
    if (precio !== undefined && (typeof precio !== 'number' || precio < 0)) {
      return res.status(400).json({
        error: 'El campo "precio" debe ser un número mayor o igual a 0.'
      });
    }
  }

  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
    return res.status(400).json({
      error: 'El campo "stock" debe ser un número mayor o igual a 0.'
    });
  }

  next();
};

//Valida los campos requeridos en registro e inicio de sesión
const validateRegisterData = (req, res, next) => {
  const { nombre, email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    return res.status(400).json({
      error: 'El nombre es obligatorio y debe tener al menos 2 caracteres.'
    });
  }
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Debes proporcionar un correo electrónico válido.'
    });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      error: 'La contraseña es obligatoria y debe tener al menos 6 caracteres.'
    });
  }

  next();
};

const validateLoginData = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Debes ingresar correo electrónico y contraseña.'
    });
  }

  next();
};

module.exports = {
  validateObjectId,
  validateProductData,
  validateRegisterData,
  validateLoginData
};