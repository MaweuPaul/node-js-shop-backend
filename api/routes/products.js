const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const productsController = require('../controllers/products');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    const now = new Date().toISOString().replace(/:/g, '-');
    cb(null, now + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  // Accept a file only if it's JPEG or PNG
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

router.get('/', productsController.products_get_all);

router.post(
  '/',
  checkAuth,
  upload.single('productImage'),
  productsController.products_create_product
);

router.get('/:productId', productsController.products_get_single_product);

router.patch(
  '/:productId',
  checkAuth,
  productsController.products_update_product
);

router.delete(
  '/:productId',
  checkAuth,
  productsController.products_delete_product
);
module.exports = router;
