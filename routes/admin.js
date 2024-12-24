const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');

const isAuth = require('../middlewares/is-auth');
const { csrfProtection } = require('../middlewares/csrf');
const getPaginationHelper = require('../middlewares/pagination');
const adminController = require('../controllers/admin');
const Product = require('../models/product');

const router = express.Router();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    const now = new Date().getTime();
    const rand = Math.floor(Math.random() * 1e9);
    cb(null, `${now}-${rand}-${file.originalname}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: fileStorage, fileFilter });

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post(
  '/add-product',
  isAuth,
  upload.single('image'),
  csrfProtection,
  addEditProductValidationMiddlewares(),
  adminController.postAddProduct
);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post(
  '/edit-product',
  isAuth,
  upload.single('image'),
  csrfProtection,
  addEditProductValidationMiddlewares(),
  adminController.postEditProduct
);

// /admin/delete-product => POST
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

// /admin/products => GET
router.get('/products', isAuth, getPaginationHelper(Product), adminController.getAdminProducts);

module.exports = router;

function addEditProductValidationMiddlewares() {
  return [
    body('title', 'Please enter valid title').trim().isString().isLength({ min: 3, max: 255 }),
    body('price', 'Please enter valid price').isFloat(),
    body('description', 'Please enter valid description').trim().isLength({ min: 8, max: 400 }),
  ];
}
