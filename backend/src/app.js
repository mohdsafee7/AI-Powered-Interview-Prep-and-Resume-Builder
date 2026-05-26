const express = require('express');
const authRouter = require('./routes/auth.route');
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use('/api/auth', authRouter); // all the routes related to authentication will be prefixed with /api/auth


module.exports = app;