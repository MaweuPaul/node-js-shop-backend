const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');

exports.user_create_user = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user) {
        return res.status(409).json({
          message: 'Email exists',
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const newUser = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });
            newUser
              .save()
              .then((result) => {
                console.log(result);
                res.status(201).json({
                  message: 'User created',
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ error: err });
              });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.user_login_user = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: 'Auth failed: ',
        });
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          // This ensures a response is sent even if there's an error during password comparison
          return res.status(401).json({ message: 'Auth failed' });
        }
        if (result) {
          // Authentication successful
          const token = jwt.sign(
            {
              email: user.email,
              userId: user._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: '1h',
            }
          );
          return res
            .status(200)
            .json({ message: 'Auth successful', token: token });
        } else {
          // Passwords do not match
          return res
            .status(401)
            .json({ message: 'Auth failed: Incorrect password' });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      // This catch block ensures a response is sent if there's an error during the execution of the query
      res.status(500).json({ error: err });
    });
};

exports.user_delete_user = (req, res, next) => {
  User.deleteOne({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: 'User deleted',
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};
