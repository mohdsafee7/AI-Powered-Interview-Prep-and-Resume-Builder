const mongoose = require('mongoose');


/**
 * - job description schema : String
 * - resume text: String
 * - self description: String
 * 
 * - matching score : Number
 * 
 * - Techniqual questions and answers : 
 *    [{
  *   question: "",
  *   intention: "",
  *   answer: "",
 *    }]
 * - Behavioral questions and answers : [{
  *   question: "",
  *   intention: "",
  *   answer: "",
 *   }]
 * - Skill gaps : [{
 *     skill: "",
 *     severity: {
 *       type: String,
 *       enum: ['low', 'medium', 'high'],
 *     }
 * }]
 * - Preparation plan : [{
 *      day : Number,
 *      focus : String,
 *      tasks : [String],
 *    }]
 */

const technicalQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  intention: {
    type: String,
    required: [true, 'Intention is required'],
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
  },
},{ _id: false });

const behavioralQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  intention: {
    type: String,
    required: [true, 'Intention is required'],
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
  },
},{ _id: false });

const skillGapsSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: [true, 'Skill is required'],
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: [true, 'Severity is required'],
  }
},{ _id: false });

const preparationPlanSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: [true, 'Day is required'],
  },
  focus: {
    type: String,
    required: [true, 'Focus is required'],
  },
  tasks: [{
    type: String,
    required: [true, 'Tasks are required'],
  }]
},{ _id: false });


const interviewReportSchema = new mongoose.Schema({
  jobDescription: {
    type: String,
    required: true,
  },
  resume: {
    type: String,
  },
  selfDescription: {
    type: String,
  },
  matchScore: {
    type: Number,
  },
  technicalQuestions: [technicalQuestionSchema],
  behavioralQuestions: [behavioralQuestionSchema],
  skillGaps: [skillGapsSchema],
  preparationPlan: [preparationPlanSchema],
}, {
  timestamps: true
})

const interviewReportModel = mongoose.model("interviewReport", interviewReportSchema);

module.exports = interviewReportModel