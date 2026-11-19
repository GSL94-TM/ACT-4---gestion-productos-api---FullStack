const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  validateObjectId,
  validateProductData
} = require('../middlewares/validationMiddleware');

//Protege todas las rutas de productos mediante JWT
router.use(verifyToken);

//Operaciones CRUD de productos
router.get('/', productController.getProducts);
router.get('/:id', validateObjectId, productController.getProductById);
router.post('/', validateProductData, productController.createProduct);
router.put('/:id', validateObjectId, validateProductData, productController.updateProduct);
router.delete('/:id', validateObjectId, productController.deleteProduct);

module.exports = router;