import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AdminPage = () => {
  const [testCode, setTestCode] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(null);
  const [message, setMessage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [isViewingAllTests, setIsViewingAllTests] = useState(false);
  const [allTests, setAllTests] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [viewResults, setViewResults] = useState(false);

  const generateTestCode = () => {
    const chars = '0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTestCode(code);
  };

  const fetchQuestions = useCallback(async () => {
    if (!testCode) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/admin/fetch-questions?testCode=${testCode}`
      );
      setQuestions(response.data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setMessage('Failed to fetch questions.');
    }
  }, [testCode]);

  useEffect(() => {
    fetchQuestions();
  }, [testCode, fetchQuestions]);

  const fetchAllTests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/view-all-tests');
      setAllTests(response.data);
    } catch (error) {
      console.error('Error fetching all tests:', error);
      setMessage('Failed to fetch tests.');
    }
  };

  const saveQuestion = async () => {
    if (!testCode || !question || options.some((opt) => !opt) || correctOption === null) {
      setMessage('Please fill in all fields and select the correct option.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/admin/save-question', {
        testCode,
        question,
        options,
        correctOption: parseInt(correctOption, 10),
      });
      setMessage(response.data.message);
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectOption(null);
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      setMessage('Failed to save the question.');
    }
  };

  const deleteQuestion = async () => {
    const questionId = questions[currentIndex]?._id;

    if (!questionId) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/admin/delete-question/${testCode}/${questionId}`
      );
      setMessage(response.data.message);
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      setMessage('Failed to delete the question.');
    }
  };

  const navigate = (direction) => {
    const newIndex =
      direction === 'next'
        ? (currentIndex + 1) % questions.length
        : (currentIndex - 1 + questions.length) % questions.length;
    setCurrentIndex(newIndex);
  };

  const fetchTestResults = async () => {
    if (!testCode) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/admin/view-results?testCode=${testCode}`
      );
      setTestResults(response.data);
      setViewResults(true);
    } catch (error) {
      console.error('Error fetching test results:', error);
      setMessage('Failed to fetch results.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Panel</h1>

      {!isCreatingTest && !isViewingAllTests && !viewResults && (
        <>
          <button onClick={() => setIsCreatingTest(true)}>Create Test</button>
          <button onClick={() => {
            fetchAllTests();
            setIsViewingAllTests(true);
          }}>View All</button>

          <div style={{ marginTop: '20px' }}>
            <input
              type="text"
              placeholder="Enter Test Code"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
            />
            <button onClick={fetchTestResults}>View Results</button>
          </div>
        </>
      )}

{viewResults && (
  <div className="results-container" style={{ padding: '20px' }}>
    <h2>Test Results for {testCode}</h2>
    {testResults.length === 0 ? (
      <p>No results available for this test.</p>
    ) : (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <strong>Total Submissions:</strong> {testResults.length}
        </div>
        {testResults.map((result, index) => (
          <div 
            key={index} 
            style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0' }}>Student Details</h3>
                <p><strong>Name:</strong> {result.userDetails.name}</p>
                <p><strong>USN:</strong> {result.userDetails.usn}</p>
                <p><strong>Branch:</strong> {result.userDetails.branch}</p>
                <p><strong>Section:</strong> {result.userDetails.section}</p>
              </div>
              <div>
                <h3 style={{ margin: '0 0 10px 0' }}>Test Performance</h3>
                <p><strong>Score:</strong> {result.score} / {result.totalQuestions}</p>
                <p><strong>Percentage:</strong> {((result.score / result.totalQuestions) * 100).toFixed(2)}%</p>
                <p><strong>Date:</strong> {new Date(result.timestamp).toLocaleString()}</p>
              </div>
            </div>
            
            <details style={{ marginTop: '15px' }}>
              <summary style={{ cursor: 'pointer', padding: '5px' }}>
                View Detailed Answers
              </summary>
              <div style={{ marginTop: '10px' }}>
                {result.answers.map((answer, ansIndex) => (
                  <div 
                    key={ansIndex} 
                    style={{ 
                      marginBottom: '10px',
                      padding: '10px',
                      backgroundColor: answer.isCorrect ? '#e8f5e9' : '#ffebee',
                      borderRadius: '4px'
                    }}
                  >
                    <p><strong>Question:</strong> {answer.questionText}</p>
                    <p><strong>Selected:</strong> {answer.selectedOption}</p>
                    <p><strong>Correct:</strong> {answer.correctOption}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        ))}
      </div>
    )}
    <button 
      onClick={() => setViewResults(false)}
      style={{
        marginTop: '20px',
        padding: '8px 16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Back
    </button>
  </div>
)}

      {isCreatingTest && (
        <div>
          <button onClick={generateTestCode}>Generate Test Code</button>
          <p>Test Code: {testCode}</p>

          <div>
            <h2>Create a Question</h2>
            <input
              type="text"
              placeholder="Enter Question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            {options.map((option, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => {
                  const updatedOptions = [...options];
                  updatedOptions[index] = e.target.value;
                  setOptions(updatedOptions);
                }}
              />
            ))}
            <select
              value={correctOption || ''}
              onChange={(e) => setCorrectOption(e.target.value)}
            >
              <option value="">Select Correct Option</option>
              {options.map((_, index) => (
                <option key={index} value={index}>
                  Option {index + 1}
                </option>
              ))}
            </select>
            <button onClick={saveQuestion}>Save Question</button>
            {message && <p>{message}</p>}
          </div>

          <div>
            <h2>Manage Questions</h2>
            {questions.length > 0 ? (
              <div>
                <p>Question: {questions[currentIndex]?.questionText}</p>
                <ul>
                  {questions[currentIndex]?.options.map((opt, idx) => (
                    <li key={idx}>
                      {opt.optionText} {opt.isCorrect ? '(Correct)' : ''}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('prev')}>Previous</button>
                <button onClick={() => navigate('next')}>Next</button>
                <button onClick={deleteQuestion}>Delete</button>
              </div>
            ) : (
              <p>No questions available.</p>
            )}
          </div>

          <button onClick={() => setIsCreatingTest(false)}>Back to Admin Panel</button>
        </div>
      )}

      {isViewingAllTests && (
        <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
          <h2>All Tests</h2>
          {allTests.length === 0 ? (
            <p>No tests available.</p>
          ) : (
            allTests.map((test, index) => (
              <div key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd' }}>
                <h3>Test Code: {test.testCode}</h3>
                <p>Number of Questions: {test.questionCount}</p>
                <details>
                  <summary>View Questions</summary>
                  {test.questions.map((question, qIndex) => (
                    <div key={qIndex} style={{ marginLeft: '20px', marginTop: '10px' }}>
                      <p><strong>Question:</strong> {question.questionText}</p>
                      <ul>
                        {question.options.map((option, oIndex) => (
                          <li key={oIndex} style={{ color: option.isCorrect ? 'green' : 'black' }}>
                            {option.optionText} {option.isCorrect && " (Correct)"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </details>
              </div>
            ))
          )}
          <button onClick={() => setIsViewingAllTests(false)}>Back</button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
