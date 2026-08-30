const express = require('express');
const interviewRouter = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const interviewController = require('../controller/interview.controller');
const upload = require('../middlewares/file.middleware');
/**
 * @route POST /api/interview/
 * @desc Generate an interview report based on the provided resume, self-description, and job description.
 * @access private
 */

interviewRouter.post('/', authMiddleware.authUser, upload.single('resume'), interviewController.generateInterviewReportController);


module.exports = interviewRouter;