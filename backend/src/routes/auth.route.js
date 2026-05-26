const express = require('express');
const { registerUserController, loginUserController, logoutUserController } = require('../controller/auth.controller');
const authRouter = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post('/register', registerUserController);

/**
 * @route POST /api/auth/login
 * @description Login a user with email and password
 * @access Public
 */
authRouter.post('/login', loginUserController);

/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access Public
 */
authRouter.get('/logout', logoutUserController);

module.exports = authRouter;