const Product = require('../models/Product');

//GET /api/products - Listar todos los productos
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('creadoPor', 'nombre email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: products.length,
      productos: products
    });
  } catch (error) {
    next(error);
  }
};

//GET /api/products/:id - Consultar un producto por su ID
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'creadoPor',
      'nombre email'
    );

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.status(200).json({ producto: product });
  } catch (error) {
    next(error);
  }
};

//POST /api/products - Crear un nuevo producto
const createProduct = async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, stock, categoria } = req.body;

    const newProduct = await Product.create({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : '',
      precio,
      stock: stock !== undefined ? stock : 0,
      categoria: categoria ? categoria.trim() : 'General',
      creadoPor: req.user.id
    });

    res.status(201).json({
      mensaje: 'Producto creado exitosamente.',
      producto: newProduct
    });
  } catch (error) {
    next(error);
  }
};

//PUT /api/products/:id - Modificar un producto existente
const updateProduct = async (req, res, next) => {
  try {
    const allowedFields = ['nombre', 'descripcion', 'precio', 'stock', 'categoria'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] =
          typeof req.body[field] === 'string'
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.status(200).json({
      mensaje: 'Producto actualizado exitosamente.',
      producto: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

//DELETE /api/products/:id - Eliminar un producto
const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.status(200).json({
      mensaje: 'Producto eliminado exitosamente.',
      producto: deletedProduct
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};