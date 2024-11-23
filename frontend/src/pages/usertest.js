import React, { useState, useEffect } from "react";
import axios from "axios";

const UserTest = () => {
  const [testCode, setTestCode] = useState(""); // Test code input
  const [questions, setQuestions] = useState([]); // Array to hold fetched questions
  const [currentIndex, setCurrentIndex] = useState(0); // Current question index
  const [score, setScore] = useState(0); // User's score
  const [selectedOptions, setSelectedOptions] = useState({}); // Track selected options for each question
  const [feedback, setFeedback] = useState([]); // Feedback for each question
  const [quizSubmitted, setQuizSubmitted] = useState(false); // Quiz submission status
  const [userDetails, setUserDetails] = useState({
    name: "",
    usn: "",
    branch: "",
    section: "",
  }); // User details form state
  const [detailsSubmitted, setDetailsSubmitted] = useState(false); // User details submission status

  // Full-screen state
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Fetch questions from the backend based on the testCode
  const fetchQuestions = async () => {
    if (!testCode) {
      alert("Please enter a test code!");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/test/fetch-questions?testCode=${testCode}`
      );
      setQuestions(response.data); // Set the fetched questions in the state
      setCurrentIndex(0);
      setScore(0);
      setSelectedOptions({});
      setFeedback([]);
      setQuizSubmitted(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("Failed to fetch questions. Please try again.");
    }
  };

  // Handle option selection
  const handleOptionClick = (index) => {
    if (selectedOptions[currentIndex] !== undefined) return; // Prevent re-selection

    const correctOption = questions[currentIndex].options.findIndex(
      (opt) => opt.isCorrect
    );
    const isCorrect = index === correctOption;

    // Update score and feedback
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    setFeedback((prevFeedback) => [
      ...prevFeedback,
      {
        questionText: questions[currentIndex].questionText,
        selectedOption: questions[currentIndex].options[index].optionText,
        isCorrect,
        correctAnswer: questions[currentIndex].options[correctOption].optionText,
      },
    ]);

    setSelectedOptions((prev) => ({ ...prev, [currentIndex]: index })); // Track selected option
  };

  // Navigate between questions
  const navigateQuestion = (direction) => {
    if (direction === "next" && currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === "prev" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Submit quiz and save results to the backend
  const submitQuiz = async () => {
    try {
      // Prepare data to send
      const payload = {
        testCode,
        userDetails,
        score,
        totalQuestions: questions.length,
        answers: feedback.map((fb) => ({
          questionText: fb.questionText,
          selectedOption: fb.selectedOption,
          correctOption: fb.correctAnswer,
          isCorrect: fb.isCorrect,
        })),
      };

      // Make POST request to backend
      const response = await axios.post(
        "http://localhost:5000/test/submit-test",
        payload
      );

      if (response.status === 201) {
        alert("Quiz results saved successfully!");
        setQuizSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz. Please try again.");
    }
  };

  // Handle user details submission
  const handleDetailsSubmit = () => {
    if (
      !userDetails.name ||
      !userDetails.usn ||
      !userDetails.branch ||
      !userDetails.section
    ) {
      alert("Please fill out all the details!");
      return;
    }
    setDetailsSubmitted(true);
    // Request full-screen mode after submitting details
    enterFullScreen();
  };

  // Enter full-screen mode
  const enterFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }

    setIsFullScreen(true);
  };

  // Handle ESC key press to prompt on exiting full-screen
  const handleEscKey = (e) => {
    if (e.key === "Escape" && isFullScreen) {
      const confirmation = window.confirm(
        "You are in full-screen mode. Do you want to exit or stay in full-screen?"
      );
      if (confirmation) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  useEffect(() => {
    // Add event listener for ESC key press
    window.addEventListener("keydown", handleEscKey);

    return () => {
      // Clean up the event listener
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [isFullScreen]);

  // View results handler
  const viewResults = () => {
    alert(`Your score is: ${score} out of ${questions.length}`);
    feedback.forEach((fb, idx) => {
      alert(
        `Question: ${fb.questionText}\nYour Answer: ${fb.selectedOption}\nCorrect Answer: ${fb.correctAnswer}`
      );
    });
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#121212",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      <h1>Test Application</h1>
      {!questions.length ? (
        <>
          {/* Step 1: Enter Test Code */}
          <input
            type="text"
            placeholder="Enter Test Code"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            style={{
              padding: "10px",
              marginBottom: "20px",
              backgroundColor: "#222",
              color: "#fff",
              border: "1px solid #444",
            }}
          />
          <button
            onClick={fetchQuestions}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Fetch Questions
          </button>
        </>
      ) : !detailsSubmitted ? (
        <>
          {/* Step 2: Enter User Details */}
          <h2>Enter Your Details</h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <input
              type="text"
              placeholder="Name"
              value={userDetails.name}
              onChange={(e) =>
                setUserDetails({ ...userDetails, name: e.target.value })
              }
              style={{
                padding: "10px",
                backgroundColor: "#222",
                color: "#fff",
                border: "1px solid #444",
              }}
            />
            <input
              type="text"
              placeholder="USN"
              value={userDetails.usn}
              onChange={(e) =>
                setUserDetails({ ...userDetails, usn: e.target.value })
              }
              style={{
                padding: "10px",
                backgroundColor: "#222",
                color: "#fff",
                border: "1px solid #444",
              }}
            />
            <input
              type="text"
              placeholder="Branch"
              value={userDetails.branch}
              onChange={(e) =>
                setUserDetails({ ...userDetails, branch: e.target.value })
              }
              style={{
                padding: "10px",
                backgroundColor: "#222",
                color: "#fff",
                border: "1px solid #444",
              }}
            />
            <input
              type="text"
              placeholder="Section"
              value={userDetails.section}
              onChange={(e) =>
                setUserDetails({ ...userDetails, section: e.target.value })
              }
              style={{
                padding: "10px",
                backgroundColor: "#222",
                color: "#fff",
                border: "1px solid #444",
              }}
            />
          </div>
          <button
            onClick={handleDetailsSubmit}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color:
              "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Submit Details
          </button>
        </>
      ) : !quizSubmitted ? (
        <>
          {/* Step 3: Display Questions */}
          <h2>Question {currentIndex + 1} of {questions.length}</h2>
          <p>{questions[currentIndex].questionText}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {questions[currentIndex].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={selectedOptions[currentIndex] !== undefined}
                style={{
                  padding: "10px",
                  backgroundColor: selectedOptions[currentIndex] === index ? (feedback[currentIndex]?.isCorrect ? "green" : "red") : "#222",
                  color: "#fff",
                  border: "1px solid #444",
                  cursor: selectedOptions[currentIndex] === undefined ? "pointer" : "not-allowed",
                }}
              >
                {option.optionText}
              </button>
            ))}
          </div>
          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => navigateQuestion("prev")}
              disabled={currentIndex === 0}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => navigateQuestion("next")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Submit Quiz
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Step 4: Show Results */}
          <h2>Quiz Results</h2>
          <p>Your Score: {score} / {questions.length}</p>
          <ul>
            {feedback.map((fb, idx) => (
              <li key={idx}>
                <strong>Question {idx + 1}:</strong> {fb.questionText} <br />
                <strong>Your Answer:</strong> {fb.selectedOption} <br />
                <strong>Correct Answer:</strong> {fb.correctAnswer} <br />
                <span style={{ color: fb.isCorrect ? "green" : "red" }}>
                  {fb.isCorrect ? "Correct" : "Incorrect"}
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => alert("Thank you for taking the test!")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </>
      )}
    </div>
  );
};

export default UserTest;