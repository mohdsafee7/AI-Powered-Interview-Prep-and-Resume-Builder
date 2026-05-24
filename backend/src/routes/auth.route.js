const express = require('express');
const { registerUserController } = require('../controller/auth.controller');
const authRouter = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post('/register', registerUserController);

module.exports = authRouter;