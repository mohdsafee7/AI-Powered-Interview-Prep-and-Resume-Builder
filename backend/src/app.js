const express = require('express');
const authRouter = require('./routes/auth.route');
const app = express();

app.use(express.json());

app.use('/api/auth', authRouter); // all the routes related to authentication will be prefixed with /api/auth


module.exports = app;