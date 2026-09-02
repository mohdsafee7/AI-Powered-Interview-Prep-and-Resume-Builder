const pdfParse = require('pdf-parse'); //this library is used to extract text from PDF files
const {generateInterviewReport, generateResumePdf} = require('../services/ai.service.js'); // Import the generateInterviewReport function from the ai.service.js file
const interviewReportModel = require('../models/interviewReport.model.js'); // Import the interviewReportModel from the interviewReport.model.js file


/**
 * @description Controller to generate an interview report based on the provided resume, self-description, and job description.
 */

async function generateInterviewReportController(req, res) {
  const resumeFile = req.file; // Access the uploaded resume file

  const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(resumeFile.buffer))).getText(); // Extract text from the PDF file

  const { selfDescription, jobDescription } = req.body; // Access the self-description and job description from the request body

  const interviewReportByAi = await generateInterviewReport({
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
  }); // Call the generateInterviewReport function with the extracted resume content, self-description, and job description


  //checking 
  console.log("Authenticated user:", req.user);
  console.log("User ID:", req.user?.id);

  const interviewReport = await interviewReportModel.create({
    user: req.user.id,
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

/**
 * @description Controller to get an interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params;

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId , user: req.user.id });

    if (!interviewReport) {
      return res.status(404).json({ message: 'Interview report not found' });
    }

    res.status(200).json({ message: 'Interview report retrieved successfully', interviewReport });
}

/**
 * @description Controller to get all interview reports of logged in user.
 */

async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}



/**
 * @description Controller to generate a resume PDF based on user self-description, resume content, and job description.
 */


async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params;

    const interviewReport = await interviewReportModel.findById(interviewReportId);

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found"
        });
    }

    const pdfBuffer = await generateResumePdf({
        resume: interviewReport.resume,
        selfDescription: interviewReport.selfDescription,
        jobDescription: interviewReport.jobDescription
    });

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume_${interviewReportId}.pdf"`,
        "Content-Length": pdfBuffer.length
    });

    return res.status(200).send(pdfBuffer);
}

module.exports = { generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController };