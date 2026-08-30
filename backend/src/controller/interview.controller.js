const pdfParse = require('pdf-parse'); //this library is used to extract text from PDF files
const generateInterviewReport = require('../services/ai.service.js'); // Import the generateInterviewReport function from the ai.service.js file
const interviewReportModel = require('../models/interviewReport.model.js'); // Import the interviewReportModel from the interviewReport.model.js file


async function generateInterviewReportController(req, res) {
  const resumeFile = req.file; // Access the uploaded resume file

  const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(resumeFile.buffer))).getText(); // Extract text from the PDF file

  const { selfDescription, jobDescription } = req.body; // Access the self-description and job description from the request body

  const interviewReportByAi = await generateInterviewReport({
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
  }); // Call the generateInterviewReport function with the extracted resume content, self-description, and job description

  const interviewReport = await interviewReportModel.create({
    user: req.user._id,
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
    ...interviewReportByAi,
  }); // Create a new interview report document in the database with the provided data


  res.status(201).json({
    message: 'Interview report generated successfully',
    interviewReport
  })
}

module.exports = { generateInterviewReportController };