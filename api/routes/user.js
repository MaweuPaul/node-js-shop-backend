const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const checkAuth = require('../middleware/check-auth');
const usersController = require('../controllers/users');

router.post('/signup', usersController.user_create_user);

router.post('/login', usersController.user_login_user);

router.delete('/:userId', checkAuth, usersController.user_delete_user);

module.exports = router;
