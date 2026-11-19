process.env.JWT_SECRET = 'test_secret_key_jwt';
process.env.JWT_EXPIRES_IN = '1h';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../app');
const User = require('../models/User');
const Product = require('../models/Product');

jest.mock('../models/User');
jest.mock('../models/Product');

describe('Pruebas de rutas y middlewares - API Gestión de Productos', () => {
  const validUserId = '507f1f77bcf86cd799439011';
  const validProductId = '507f1f77bcf86cd799439022';
  let validToken;

  beforeEach(() => {
    validToken = jwt.sign(
      { id: validUserId, nombre: 'Usuario Prueba', email: 'test@correo.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  //RUTAS INEXISTENTES
  test('GET /api/health debe responder 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.estado).toBe('OK');
  });

  test('GET /api/ruta-inexistente debe devolver 404 JSON', async () => {
    const res = await request(app).get('/api/ruta-inexistente');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toContain('Ruta no encontrada');
  });

  //RUTAS DE AUTENTICACIÓN
  test('POST /api/auth/register debe devolver 400 con datos inválidos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'A', email: 'correo_malo', password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('POST /api/auth/login debe autenticar y devolver JWT (200)', async () => {
    const hashedPassword = await bcrypt.hash('secreta123', 10);
    User.findOne.mockResolvedValue({
      _id: validUserId,
      nombre: 'Usuario Prueba',
      email: 'test@correo.com',
      password: hashedPassword
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@correo.com', password: 'secreta123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  //Ajuste manual: comproba que tras logout el mismo token queda bloqueado
  test('POST /api/auth/logout debe revocar el token y bloquear su reutilización', async () => {
    const tokenParaCerrar = jwt.sign(
      { id: validUserId, nombre: 'Logout Test', email: 'logout@correo.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${tokenParaCerrar}`);
    expect(logoutRes.statusCode).toBe(200);

    const retryRes = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${tokenParaCerrar}`);
    expect(retryRes.statusCode).toBe(401);
    expect(retryRes.body.error).toContain('sesión fue cerrada');
  });

  //PROTECCIÓN JWT Y RUTAS CRUD DE PRODUCTOS
  test('GET /api/products sin token debe responder 401', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/products con token inválido debe responder 401', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', 'Bearer token_falso_invalido');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/products con JWT válido debe devolver productos (200)', async () => {
    Product.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ _id: validProductId, nombre: 'Audífonos', precio: 800 }])
      })
    });

    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(1);
  });

  test('POST /api/products con precio negativo debe responder 400 por middleware de validación', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ nombre: 'Audífonos', precio: -50 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('precio');
  });

  test('POST /api/products con datos válidos y JWT debe crear producto (201)', async () => {
    const nuevo = {
      _id: validProductId,
      nombre: 'Teclado Mecánico',
      precio: 1400,
      stock: 6,
      categoria: 'Accesorios',
      creadoPor: validUserId
    };
    Product.create.mockResolvedValue(nuevo);

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ nombre: 'Teclado Mecánico', precio: 1400, stock: 6, categoria: 'Accesorios' });

    expect(res.statusCode).toBe(201);
    expect(res.body.producto.nombre).toBe('Teclado Mecánico');
  });

  test('GET /api/products/:id con formato de ID inválido debe devolver 400', async () => {
    const res = await request(app)
      .get('/api/products/id-no-valido')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('formato válido');
  });

  test('PUT /api/products/:id con cuerpo vacío debe devolver 400', async () => {
    const res = await request(app)
      .put(`/api/products/${validProductId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
  });

  test('PUT /api/products/:id válido debe actualizar producto (200)', async () => {
    Product.findByIdAndUpdate.mockResolvedValue({
      _id: validProductId,
      nombre: 'Teclado Mecánico Pro',
      precio: 1600
    });

    const res = await request(app)
      .put(`/api/products/${validProductId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ nombre: 'Teclado Mecánico Pro', precio: 1600 });

    expect(res.statusCode).toBe(200);
    expect(res.body.producto.precio).toBe(1600);
  });

  test('DELETE /api/products/:id válido debe eliminar producto (200)', async () => {
    Product.findByIdAndDelete.mockResolvedValue({
      _id: validProductId,
      nombre: 'Teclado Mecánico Pro'
    });

    const res = await request(app)
      .delete(`/api/products/${validProductId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Producto eliminado exitosamente.');
  });
});