const express = require('express');

const shopController = require('../controllers/shop');
const errorController = require('../controllers/error');

const router = express.Router();

router.get('/products/:productId', shopController.getProductDetails);

router.get('/products', shopController.getProducts);

router.get('/cart', shopController.getCart);

router.post('/cart', shopController.postCart);

router.post('/cart-delete-item', shopController.postCartDeleteProduct);

router.get('/checkout', shopController.getCheckout);

router.get('/orders', shopController.getOrders);

router.get('/product-not-found', errorController.getProductNotFound);

router.get('/', shopController.getIndex);

module.exports = router;
