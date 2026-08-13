const express = require('express');
const authRouter = require('./routes/auth.route');
const cookieParser = require("cookie-parser");

const app = express(); // express application

app.use(express.json()); //it reads incoming requests with JSON payloads and makes the data available in req.body

app.use(cookieParser());

app.use('/api/auth', authRouter); // all the routes related to authentication will be prefixed with /api/auth


module.exports = app;