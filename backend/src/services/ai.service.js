const { GoogleGenAI } = require("@google/genai");

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
  },

  required: [
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

module.exports = generateInterviewReport;