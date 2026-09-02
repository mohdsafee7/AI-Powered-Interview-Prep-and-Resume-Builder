const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const pdfParse = require("pdf-parse");
const puppeteer = require("puppeteer");
const { zodToJsonSchema } = require("zod-to-json-schema");



const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = {
  type: "object",
  properties: {
    matchScore: {
      type: "number",
      description:
        "A score from 0 to 100 representing how well the candidate matches the job description.",
    },

    summary: {
      type: "string",
      description:
        "A detailed 2-3 paragraph assessment of the candidate's suitability for this specific role.",
    },

    strengths: {
      type: "array",
      items: {
        type: "string",
      },
      description:
        "5-7 specific strengths supported by evidence from the resume.",
    },

    technicalQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description:
              "A complete technical interview question.",
          },

          intention: {
            type: "string",
            description:
              "What the interviewer is trying to evaluate.",
          },

          answer: {
            type: "string",
            description:
              "A detailed answer guide explaining what the candidate should say and which concepts should be covered.",
          },
        },
        required: ["question", "intention", "answer"],
      },
      description:
        "10 highly relevant technical interview questions.",
    },

    behavioralQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
          },

          intention: {
            type: "string",
          },

          answer: {
            type: "string",
          },
        },
        required: ["question", "intention", "answer"],
      },
      description:
        "6 personalized behavioral interview questions.",
    },

    skillGaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: {
            type: "string",
          },

          severity: {
            type: "string",
            enum: ["low", "medium", "high"],
          },

          explanation: {
            type: "string",
            description:
              "Why this is a gap based on the job description and resume.",
          },
        },
        required: ["skill", "severity", "explanation"],
      },
    },

    preparationPlan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: {
            type: "number",
          },

          focus: {
            type: "string",
          },

          tasks: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },

    title : {
      type: "string",
      description: "A title of the job for which the report is generated."
    },
  },

  required: [
    "title",
    "matchScore",
    "summary",
    "strengths",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
};

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {

  const prompt = `
You are a senior technical interviewer and career coach.

Analyze the candidate's resume against the job description and create a personalized interview preparation report.

IMPORTANT:

- Only use information actually present in the resume.
- Never invent experience, skills, projects, certifications or achievements.
- Every technical question must be a COMPLETE interview question.
- Do NOT output keywords or topic lists as questions.
- Do NOT combine many unrelated topics into one question.
- Do NOT write things like:
  "JWT React Node PostgreSQL indexing..."
- Instead write a natural interview question such as:
  "How did you implement JWT authentication in your project, and how did you protect authenticated routes?"
- Technical questions must be directly related to the job description, resume, projects or important CS fundamentals for the role.
- Include project-specific questions.
- Include questions that an interviewer could realistically ask a fresher.
- Behavioral questions must be personalized to this candidate.
- Skill gaps must come from comparing the resume with the job description.
- Do not call something a skill gap if the resume clearly demonstrates it.
- Match score must be between 0 and 100.
- Give more weight to required skills than optional skills.
- Answers must be detailed enough to actually prepare the candidate for an interview.
- Each answer should explain the important points the candidate should cover.
- Do not give one-line answers.

TECHNICAL QUESTIONS:

Generate exactly 10.

Include:
1. Core CS fundamentals
2. Programming
3. Job-specific technologies
4. Resume-based questions
5. Project deep dives
6. Problem-solving/scenario questions

BEHAVIORAL QUESTIONS:

Generate exactly 6.

Include questions around:
- teamwork
- conflict
- failure
- problem solving
- project ownership
- motivation

PREPARATION PLAN:

Generate exactly 7 days.

Each day should contain 3-5 concrete tasks.

==================================================
RESUME
==================================================

${resume}

==================================================
SELF DESCRIPTION
==================================================

${selfDescription}

==================================================
JOB DESCRIPTION
==================================================

${jobDescription}

==================================================

Return ONLY valid JSON matching the provided schema.
`;

  try {

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: prompt,

      config: {
        responseMimeType: "application/json",
        responseSchema: interviewReportSchema,
      },
    });

    const report = JSON.parse(response.text);
    // console.log(report);
    return report;

  } catch (error) {

    console.error("Gemini report generation error:", error);

    throw error;
  }
}


async function generatePdfFromHtml(htmlContent) {

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
        waitUntil: "domcontentloaded"
    });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
            top: "8mm",
            bottom: "8mm",
            left: "8mm",
            right: "8mm"
        }
    });

    await browser.close();

    return pdfBuffer;
}


async function generateResumePdf({ resume, selfDescription, jobDescription }) {

  // console.log("1. generateResumePdf started");

  const resumePdfSchema = z.object({
    html: z.string().describe("HTML content of the resume")
  });

  // console.log("2. Schema created");

  // const prompt = `Generate a resume for a candidate with the following details:
  //   Resume: ${resume}
  //   Self Description: ${selfDescription}
  //   Job Description: ${jobDescription}

  //   The format should be JSON object with a single field "html"
  //   which contains the HTML content of the resume which can be converted to PDF.
  // `;

  //START
  const prompt = `
  Create a professional, ATS-friendly, ONE-PAGE A4 resume tailored to the job description using the candidate's existing resume and self-description.

  IMPORTANT RULES:

  - Use ONLY information provided in the candidate's resume/self-description. Never invent skills, experience, projects, education, certifications, achievements, links or dates.
  - Tailor the resume to the job description by prioritizing relevant skills, projects, coursework and achievements that genuinely match the role.
  - Do not blindly copy keywords from the job description unless the candidate actually has them.
  - The resume must look human-written and professionally designed, NOT generic or AI-generated.
  - Use concise, specific, action-oriented bullet points. Avoid buzzwords, exaggerated claims and repetitive phrases such as "passionate", "highly motivated", "results-driven", "leveraged", or "dynamic" unless genuinely appropriate.
  - Do not add unnecessary sections or filler content.

  STRUCTURE:

  1. NAME + CONTACT INFORMATION
  2. CAREER OBJECTIVE
    - Write a personalized 3-4 line objective.
    - Mention the candidate's actual background, strongest relevant technical skills and target role.
    - Make it specific to the job description rather than a generic career statement.

  3. EDUCATION
    - Degree, institution, dates and CGPA/percentage where available.

  4. TECHNICAL COMPETENCIES
    - Organize relevant skills into clear categories such as Languages, Frontend, Backend, Databases, Tools and Core Subjects.
    - Prioritize skills relevant to the target job.

  5. PROJECTS
    - Include the most relevant 2-3 projects.
    - Give each project 2-4 concise bullets.
    - Focus on what was built, technologies used, important implementation details and measurable/technical impact when actually provided.
    - Do not invent metrics.

  6. CERTIFICATIONS & ACHIEVEMENTS
    - Include relevant certifications and genuine achievements.
    - Prioritize items that strengthen the candidate's fit for the target role.

  LAYOUT:

  - The COMPLETE resume MUST fit on EXACTLY ONE A4 PAGE.
  - Use the A4 page efficiently. Do NOT leave large unused blank areas at the bottom or sides.
  - Use narrow but professional page margins: approximately 0.45-0.55 inch on all four sides.
  - Use the full available content width while maintaining clean alignment.
  - Keep the resume visually dense but NOT cramped.
  - Body font size should be approximately 9.5-10.5px with comfortable line-height around 1.25-1.35.
  - Candidate name should be larger and prominent, but do not waste vertical space with a large header.
  - Keep section headings compact with approximately 6-8px spacing before and 3-5px after each heading.
  - Keep project entries compact: approximately 2-4 concise bullets per project with minimal spacing between bullets.
  - Keep bullet line-height tight and avoid unnecessary gaps between bullet points.
  - Avoid excessive padding and margins inside sections.
  - Keep education and certification entries compact and aligned efficiently.
  - Do NOT insert unnecessary blank lines between sections.
  - Do NOT vertically center the resume or distribute content evenly across the page.
  - Content should naturally start near the top margin and use the available page height efficiently.
  - Do NOT stretch content artificially just to fill the page; maintain a professional resume appearance.
  - If content is too long, prioritize the most relevant information and remove redundancy rather than shrinking the entire resume excessively.
  - If content is shorter than one page, use the available page width and reasonable spacing rather than leaving a large empty bottom area.
  - Do NOT create a second page.
  - Do NOT use extremely small text to force content onto one page.
  - The final result should resemble a professionally typeset one-page resume created manually in Overleaf: compact, structured, readable and information-dense.

  ATS REQUIREMENTS:

  - Use standard section headings.
  - Use simple HTML/CSS structure that renders reliably in Puppeteer.
  - Do not use images, icons, charts, progress bars, columns that may break text extraction, or decorative elements that reduce ATS readability.
  - Use readable fonts and strong text hierarchy.
  - Keep contact information clearly visible at the top.

  HTML REQUIREMENTS:

  - Return a complete self-contained HTML document.
  - Include all CSS inside a <style> tag.
  - Set the document/page dimensions specifically for A4.
  - Ensure the layout is optimized for Puppeteer PDF rendering.
  - Use print-friendly CSS.
  - The final HTML must render as exactly ONE A4 page.

  Candidate Resume:
  ${resume}

  Candidate Self Description:
  ${selfDescription}

  Target Job Description:
  ${jobDescription}

  Return ONLY valid JSON:
  {
    "html": "complete HTML resume"
  }
  `;




  //END

  // console.log("3. Calling Gemini...");

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  });

  // console.log("4. Gemini response received");

  const jsonContent = JSON.parse(response.text);

  // console.log("5. HTML received");
  // console.log("HTML length:", jsonContent.html.length);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  // console.log("6. PDF generated");

  return pdfBuffer;
}

module.exports = {generateInterviewReport, generateResumePdf};