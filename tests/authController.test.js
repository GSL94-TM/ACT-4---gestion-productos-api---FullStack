process.env.JWT_SECRET = 'test_secret_key_jwt';
process.env.JWT_EXPIRES_IN = '1h';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { register, login, logout, getProfile } = require('../controllers/authController');
const { revokeToken } = require('../middlewares/authMiddleware');

jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../middlewares/authMiddleware', () => ({
  revokeToken: jest.fn()
}));

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Pruebas unitarias - authController', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    res = createMockRes();
    next = jest.fn();
  });

  //REGISTER
  test('register: debe registrar un usuario nuevo con contraseña hasheada (201)', async () => {
    req = {
      body: { nombre: 'Ana López', email: 'ANA@Correo.com', password: 'password123' }
    };
    User.findOne.mockResolvedValue(null);
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashed_password');
    User.create.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      nombre: 'Ana López',
      email: 'ana@correo.com'
    });

    await register(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'ana@correo.com' });
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensaje: 'Usuario registrado exitosamente.' })
    );
  });

  //Ajuste manual: validar rechazo de correo duplicado
  test('register: debe devolver 400 si el correo ya está registrado', async () => {
    req = {
      body: { nombre: 'Ana', email: 'ana@correo.com', password: 'password123' }
    };
    User.findOne.mockResolvedValue({ _id: '123', email: 'ana@correo.com' });

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Ya existe una cuenta registrada con este correo electrónico.'
    });
  });

  //LOGIN
  test('login: debe devolver un token JWT cuando las credenciales son válidas (200)', async () => {
    req = { body: { email: 'ana@correo.com', password: 'password123' } };
    User.findOne.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      nombre: 'Ana López',
      email: 'ana@correo.com',
      password: 'hashed_password'
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake.jwt.token');

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        mensaje: 'Inicio de sesión exitoso.',
        token: 'fake.jwt.token'
      })
    );
  });

  test('login: debe devolver 401 si el usuario no existe', async () => {
    req = { body: { email: 'noexiste@correo.com', password: 'password123' } };
    User.findOne.mockResolvedValue(null);

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas.' });
  });

  test('login: debe devolver 401 si la contraseña no coincide', async () => {
    req = { body: { email: 'ana@correo.com', password: 'incorrecta' } };
    User.findOne.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'ana@correo.com',
      password: 'hashed_password'
    });
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas.' });
  });

  //LOGOUT
  //Ajuste manual: verifica revocación del token activo
  test('logout: debe revocar el token y devolver 200', async () => {
    req = { token: 'token_activo_123' };

    await logout(req, res, next);

    expect(revokeToken).toHaveBeenCalledWith('token_activo_123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Sesión cerrada exitosamente.' });
  });

  //PROFILE
  //Ajuste manual: simula encadenamiento .select('-password') de Mongoose
  test('getProfile: debe devolver los datos del usuario sin contraseña (200)', async () => {
    req = { user: { id: '507f1f77bcf86cd799439011' } };
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      nombre: 'Ana López',
      email: 'ana@correo.com',
      createdAt: '2026-11-18'
    };
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    await getProfile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      usuario: {
        id: mockUser._id,
        nombre: mockUser.nombre,
        email: mockUser.email,
        createdAt: mockUser.createdAt
      }
    });
  });

  test('getProfile: debe devolver 404 si el usuario no existe', async () => {
    req = { user: { id: '507f1f77bcf86cd799439099' } };
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    await getProfile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado.' });
  });
});