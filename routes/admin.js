const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post(
  '/add-product',
  addEditProductValidationMiddlewares(),
  isAuth,
  adminController.postAddProduct
);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post(
  '/edit-product',
  addEditProductValidationMiddlewares(),
  isAuth,
  adminController.postEditProduct
);

// /admin/delete-product => POST
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getAdminProducts);

module.exports = router;

function addEditProductValidationMiddlewares() {
  return [
    body('title', 'Please enter valid title').trim().isString().isLength({ min: 3, max: 255 }),
    body('imageUrl', 'Please enter a valid URL for product image').isURL(),
    body('price', 'Please enter valid price').isFloat(),
    body('description', 'Please enter valid description').trim().isLength({ min: 8, max: 400 }),
  ];
}
