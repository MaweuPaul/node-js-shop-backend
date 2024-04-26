const Product = require('../models/product');
const mongoose = require('mongoose');

exports.products_get_all = (req, res, next) => {
  Product.find()
    .select('name price _id productImage')
    .exec()
    .then((prods) => {
      const response = {
        count: prods.length,
        products: prods.map((prod) => {
          return {
            name: prod.name,
            price: prod.price,
            productImage: prod.productImage,
            _id: prod._id,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/products/' + prod._id,
            },
          };
        }),
      };
      res.status(201).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.products_get_single_product = (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then((prod) => {
      if (prod) {
        res.status(200).json({
          product: prod,
          request: {
            type: 'GET',
            description: 'GET ALL PRODUCTS',
            url: 'http://localhost:3000/products/',
          },
        });
      } else {
        res.status(404).json({ message: 'No valid entry found' });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.products_delete_product = (req, res, next) => {
  const id = req.params.productId;
  Product.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: 'Product deleted successfull',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/products',
          data: {
            name: 'String',
            price: 'Number',
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.products_create_product = (req, res, next) => {
  // Check if the file was uploaded
  if (!req.file) {
    return res.status(400).json({
      message: 'No file uploaded. Please upload a product image.',
    });
  }
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
  });

  product
    .save()
    .then((result) => {
      res.status(201).json({
        message: 'Created Product successfully',
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          productImage: result.productImage,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/products/' + result._id,
          },
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.products_update_product = (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: 'Message updated successfully',
        request: {
          type: 'GET',
          url: 'http://localhost:3000/products' + id,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};
