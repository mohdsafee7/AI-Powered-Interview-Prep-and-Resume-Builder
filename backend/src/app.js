const express = require('express');
const authRouter = require('./routes/auth.route');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const interviewRouter = require('./routes/interview.routes');

const app = express(); // express application

app.use(express.json()); //it reads incoming requests with JSON payloads and makes the data available in req.body

app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use('/api/auth', authRouter); // all the routes related to authentication will be prefixed with /api/auth
app.use('/api/interview', interviewRouter); // all the routes related to interview will be prefixed with /api/interview

module.exports = app;