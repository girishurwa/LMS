const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  testCode: { type: String, required: true },
  userDetails: {
    name: { type: String, required: true },
    usn: { type: String, required: true },
    branch: { type: String, required: true },
    section: { type: String, required: true },
  },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: [
    {
      questionText: { type: String, required: true },
      selectedOption: { type: String, required: true },
      correctOption: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
    },
  ],
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TestResult', testResultSchema);
