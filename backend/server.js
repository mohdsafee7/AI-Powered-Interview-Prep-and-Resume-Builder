require('dotenv').config();
const app = require('./src/app');
const connectToDB = require('./src/config/database.js');
// const { resume, selfDescription, jobDescription } = require('./src/services/temp.js');
// const generateInterviewReport = require('./src/services/ai.service.js');


const startServer = async () => {

  await connectToDB();

  // await generateInterviewReport({ resume, selfDescription, jobDescription });

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });

};

startServer();