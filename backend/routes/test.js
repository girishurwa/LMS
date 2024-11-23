// routes/test.js

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();


// Add this below the fetch-questions route
router.post('/submit-test', async (req, res) => {
  const { testCode, userDetails, score, totalQuestions, answers } = req.body;

  // Validate input
  if (!testCode || !userDetails || !score || !totalQuestions || !answers) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const TestResult = require('../models/testresult'); // Import the TestResult model
    const testResult = new TestResult({
      testCode,
      userDetails,
      score,
      totalQuestions,
      answers,
    });

    await testResult.save(); // Save the result to the database
    res.status(201).json({ message: 'Test result saved successfully.' });
  } catch (error) {
    console.error('Error saving test result:', error);
    res.status(500).json({ message: 'Error saving test result.' });
  }
});



// Define a reusable function to get the model dynamically based on the testCode
const getQuestionModel = (testCode) => {
  // This ensures you are querying the collection dynamically based on the testCode
  const schema = new mongoose.Schema({
    testCode: { type: String, required: true },
    questionText: { type: String, required: true },
    options: [
      {
        optionText: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
  });

  return mongoose.models[testCode] || mongoose.model(testCode, schema, testCode);  // `testCode` is the collection name
};

// Route to fetch all questions for a test code
router.get('/fetch-questions', async (req, res) => {
  const { testCode } = req.query;

  if (!testCode) {
    return res.status(400).json({ message: 'Test code is required.' });
  }

  try {
    const QuestionModel = getQuestionModel(testCode);
    const questions = await QuestionModel.find();  // Fetch questions from the dynamically chosen collection
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions.' });
  }
});

module.exports = router;
