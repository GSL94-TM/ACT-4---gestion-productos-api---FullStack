const Product = require('../models/Product');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

jest.mock('../models/Product');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Pruebas unitarias - productController', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    res = createMockRes();
    next = jest.fn();
  });

  //Ajuste manual: mock del encadenamiento find().populate().sort() de Mongoose
  test('getProducts: debe devolver la lista de productos y su total (200)', async () => {
    const mockProducts = [
      { _id: '1', nombre: 'Laptop', precio: 15000 },
      { _id: '2', nombre: 'Mouse', precio: 450 }
    ];
    Product.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockProducts)
      })
    });

    await getProducts({}, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      total: 2,
      productos: mockProducts
    });
  });

  test('getProductById: debe devolver un producto existente (200)', async () => {
    const mockProduct = { _id: '507f1f77bcf86cd799439011', nombre: 'Teclado', precio: 900 };
    req = { params: { id: '507f1f77bcf86cd799439011' } };
    Product.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockProduct)
    });

    await getProductById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ producto: mockProduct });
  });

  test('getProductById: debe devolver 404 si el producto no existe', async () => {
    req = { params: { id: '507f1f77bcf86cd799439099' } };
    Product.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null)
    });

    await getProductById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Producto no encontrado.' });
  });

  test('createProduct: debe crear un producto asociando creadoPor del JWT (201)', async () => {
    req = {
      body: { nombre: 'Monitor 27"', descripcion: '4K', precio: 6500, stock: 5, categoria: 'Pantallas' },
      user: { id: '507f1f77bcf86cd799439011' }
    };
    const created = { _id: '507f1f77bcf86cd799439022', ...req.body, creadoPor: req.user.id };
    Product.create.mockResolvedValue(created);

    await createProduct(req, res, next);

    expect(Product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Monitor 27"',
        creadoPor: '507f1f77bcf86cd799439011'
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Producto creado exitosamente.',
      producto: created
    });
  });

  test('updateProduct: debe actualizar un producto existente (200)', async () => {
    req = {
      params: { id: '507f1f77bcf86cd799439022' },
      body: { precio: 5999, stock: 8 }
    };
    const updated = { _id: req.params.id, nombre: 'Monitor 27"', precio: 5999, stock: 8 };
    Product.findByIdAndUpdate.mockResolvedValue(updated);

    await updateProduct(req, res, next);

    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
      req.params.id,
      { precio: 5999, stock: 8 },
      { new: true, runValidators: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Producto actualizado exitosamente.',
      producto: updated
    });
  });

  test('updateProduct: debe devolver 404 si el producto a actualizar no existe', async () => {
    req = { params: { id: '507f1f77bcf86cd799439099' }, body: { precio: 100 } };
    Product.findByIdAndUpdate.mockResolvedValue(null);

    await updateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Producto no encontrado.' });
  });

  test('deleteProduct: debe eliminar un producto existente (200)', async () => {
    req = { params: { id: '507f1f77bcf86cd799439022' } };
    const deleted = { _id: req.params.id, nombre: 'Monitor 27"' };
    Product.findByIdAndDelete.mockResolvedValue(deleted);

    await deleteProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Producto eliminado exitosamente.',
      producto: deleted
    });
  });

  test('deleteProduct: debe devolver 404 si el producto a eliminar no existe', async () => {
    req = { params: { id: '507f1f77bcf86cd799439099' } };
    Product.findByIdAndDelete.mockResolvedValue(null);

    await deleteProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Producto no encontrado.' });
  });

  //Ajuste manual: valida delegación de excepciones al middleware global de errores
  test('getProducts: debe delegar errores de base de datos a next(error)', async () => {
    const dbError = new Error('Fallo de conexión');
    Product.find.mockImplementation(() => {
      throw dbError;
    });

    await getProducts({}, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});