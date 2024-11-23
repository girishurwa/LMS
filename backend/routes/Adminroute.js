const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import TestResult model
const TestResult = require('../models/testresult');

// Route to save a question to a test code collection
router.post('/save-question', async (req, res) => {
  const { testCode, question, options, correctOption } = req.body;

  if (!testCode || !question || !options || correctOption === null) {
    return res.status(400).json({ message: 'Please fill in all fields and select the correct option.' });
  }

  const optionsArray = options.map((option, index) => ({
    optionText: option,
    isCorrect: index === correctOption,
  }));

  try {
    // Define schema for the test code
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

    // Register the model dynamically
    let QuestionModel = mongoose.models[testCode] || mongoose.model(testCode, schema);

    const newQuestion = new QuestionModel({
      testCode,
      questionText: question,
      options: optionsArray,
    });

    await newQuestion.save();
    res.status(200).json({ message: 'Question saved successfully!' });
  } catch (error) {
    console.error('Error saving question: ', error);
    res.status(500).json({ message: 'Error saving question' });
  }
});

// Route to fetch all questions for a given test code
router.get('/fetch-questions', async (req, res) => {
  const { testCode } = req.query;

  if (!testCode) {
    return res.status(400).json({ message: 'Test code is required' });
  }

  try {
    let QuestionModel = mongoose.models[testCode];
    if (!QuestionModel) {
      return res.status(404).json({ message: `Model for test code ${testCode} not found` });
    }

    const questions = await QuestionModel.find();
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions: ', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Route to delete a question
router.delete('/delete-question/:testCode/:questionId', async (req, res) => {
  const { testCode, questionId } = req.params;

  if (!testCode || !questionId) {
    return res.status(400).json({ message: 'Test code and question ID are required' });
  }

  try {
    let QuestionModel = mongoose.models[testCode];
    if (!QuestionModel) {
      return res.status(404).json({ message: `Model for test code ${testCode} not found` });
    }

    const result = await QuestionModel.findByIdAndDelete(questionId);

    if (!result) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question: ', error);
    res.status(500).json({ message: 'Error deleting question' });
  }
});

// Route to fetch all test collections
router.get('/view-all-tests', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const testCollections = [];

    for (let collection of collections) {
      const collectionName = collection.name;
      
      // Only process collections that match test code pattern
      if (collectionName.match(/^[0-9]{6}$/)) {
        // Create a dynamic schema if model doesn't exist
        const dynamicSchema = new mongoose.Schema({
          testCode: { type: String, required: true },
          questionText: { type: String, required: true },
          options: [{
            optionText: { type: String, required: true },
            isCorrect: { type: Boolean, required: true }
          }]
        });

        let Model;
        try {
          Model = mongoose.models[collectionName] || mongoose.model(collectionName, dynamicSchema);
        } catch (modelError) {
          console.error(`Error registering model for ${collectionName}:`, modelError);
          continue;
        }

        try {
          const questions = await Model.find();
          testCollections.push({
            testCode: collectionName,
            questionCount: questions.length,
            questions: questions
          });
        } catch (queryError) {
          console.error(`Error querying collection ${collectionName}:`, queryError);
        }
      }
    }

    res.status(200).json(testCollections);
  } catch (error) {
    console.error('Error fetching test collections:', error);
    res.status(500).json({ message: 'Error retrieving test collections' });
  }
});

// Route to view test results
router.get('/view-results', async (req, res) => {
  const { testCode } = req.query;

  if (!testCode) {
    return res.status(400).json({ message: 'Test code is required' });
  }

  try {
    const results = await TestResult.find({ testCode })
      .sort({ timestamp: -1 })
      .select('userDetails score totalQuestions timestamp answers');
    
    // Format the results to include all necessary information
    const formattedResults = results.map(result => ({
      userDetails: {
        name: result.userDetails.name,
        usn: result.userDetails.usn,
        branch: result.userDetails.branch,
        section: result.userDetails.section
      },
      score: result.score,
      totalQuestions: result.totalQuestions,
      timestamp: result.timestamp,
      answers: result.answers
    }));
    
    res.status(200).json(formattedResults);
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ message: 'Error retrieving test results' });
  }
});
module.exports = router;