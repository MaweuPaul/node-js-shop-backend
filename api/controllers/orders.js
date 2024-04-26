const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');
exports.orders_get_all = (req, res, next) => {
  Order.find()
    .select(' product quantity _id')
    .populate('product', 'name')
    .exec()
    .then((results) => {
      res.status(200).json({
        count: results.length,
        orders: results.map((result) => {
          return {
            _id: result._id,
            product: result.product,
            quantity: result.quantity,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/orders/' + result._id,
            },
          };
        }),
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.orders_create_order = (req, res) => {
  const { productId, quantity } = req.body;

  // Validate presence and format of productId, and presence of quantity
  if (!productId) {
    return res.status(400).json({
      message: 'Missing productId in request body',
    });
  }
  if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
    return res.status(400).json({
      message: 'Invalid productId format. Must be a 24 character hex string.',
    });
  }
  if (quantity === undefined) {
    // Explicitly check for undefined to allow quantity of 0
    return res.status(400).json({
      message: 'Missing quantity in request body',
    });
  }

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: 'Product not found',
        });
      }
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        quantity: quantity,
        product: productId,
      });
      return order.save();
    })
    .then((result) => {
      res.status(201).json({
        message: 'Order stored',
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity,
        },
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders/' + result._id,
        },
      });
    })
    .catch((err) => {
      if (!res.headersSent) {
        res.status(500).json({
          error: err,
        });
      }
    });
};

exports.orders_get_order_by_id = (req, res, next) => {
  Order.findById(req.params.orderId)
    .select(' product quantity _id')
    .populate('product')

    .exec()
    .then((order) => {
      if (!order) {
        // If no order is found, send a 404 response and return immediately
        return res.status(404).json({
          message: 'Order not found',
        });
      }
      // If an order is found, send the order details
      res.status(200).json({
        order: order,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders',
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.orders_delete_order = (req, res, next) => {
  Order.deleteOne({ _id: req.params.orderId })
    .exec()
    .then((result) => {
      if (result.deletedCount === 0) {
        // If no documents were deleted, respond with a 404 not found message
        return res.status(404).json({
          message: 'Order not found',
        });
      }
      // If the document was deleted, respond with a success message
      res.status(200).json({
        message: 'Order deleted',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/orders',
          body: {
            productId: 'ID', // Note: Corrected "productID" to "productId" for consistency
            quantity: 'Number',
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
