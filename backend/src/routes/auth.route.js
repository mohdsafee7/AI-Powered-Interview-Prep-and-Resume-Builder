const express = require('express');

const { registerUserController, loginUserController, logoutUserController, getMeController } = require('../controller/auth.controller');
const authRouter = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

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


/**
 * @route GET /api/auth/get-me
 * @description Get the currently logged in user's information, expects a valid token in the cookie
 * @access Private
 */
authRouter.get('/get-me', authMiddleware.authUser, getMeController); //middleware will identify who sending the request and will add the user information in the request object,
// so that we can use it in the controller function to get the user information from the database


module.exports = authRouter;