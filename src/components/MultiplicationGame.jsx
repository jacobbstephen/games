import React, { useState, useEffect, useCallback } from 'react';
import { Star, RotateCcw, Volume2 } from 'lucide-react';

const MultiplicationGame = () => {
  const [gameState, setGameState] = useState('home'); // 'home', 'playing', 'celebration'
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [problems, setProblems] = useState([]);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(null); // 'correct', 'incorrect'
  const [shakeButton, setShakeButton] = useState(null);

  // Text-to-speech function
  const speak = useCallback((text, rate = 1) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Generate problems for selected table
  const generateProblems = useCallback((table) => {
    const problems = [];
    const usedMultipliers = new Set();
    
    while (problems.length < 10) {
      const multiplier = Math.floor(Math.random() * 12) + 1;
      if (!usedMultipliers.has(multiplier)) {
        usedMultipliers.add(multiplier);
        const correctAnswer = table * multiplier;
        
        // Generate wrong answers
        const wrongAnswers = new Set();
        while (wrongAnswers.size < 3) {
          const wrong = correctAnswer + (Math.floor(Math.random() * 20) - 10);
          if (wrong > 0 && wrong !== correctAnswer) {
            wrongAnswers.add(wrong);
          }
        }
        
        // Shuffle answers
        const answers = [correctAnswer, ...Array.from(wrongAnswers)];
        for (let i = answers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [answers[i], answers[j]] = [answers[j], answers[i]];
        }
        
        problems.push({
          question: `${table} × ${multiplier}`,
          correctAnswer,
          answers
        });
      }
    }
    
    return problems;
  }, []);

  // Start game with selected table
  const startGame = useCallback((table) => {
    setSelectedTable(table);
    setProblems(generateProblems(table));
    setCurrentQuestion(0);
    setScore(0);
    setGameState('playing');
    setShowFeedback(null);
    
    // Announce game start
    setTimeout(() => {
      speak(`Starting multiplication table of ${table}. Here's your first question.`);
    }, 500);
  }, [generateProblems, speak]);

  // Handle answer selection
  const handleAnswer = useCallback((selectedAnswer) => {
    const currentProblem = problems[currentQuestion];
    const isCorrect = selectedAnswer === currentProblem.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      setShowFeedback('correct');
      speak('Good job!', 1.2);
      
      setTimeout(() => {
        setShowFeedback(null);
        if (currentQuestion < 9) {
          setCurrentQuestion(currentQuestion + 1);
          setTimeout(() => {
            const nextProblem = problems[currentQuestion + 1];
            speak(`Next question: ${nextProblem.question.replace('×', 'times')}`);
          }, 500);
        } else {
          setGameState('celebration');
          setTimeout(() => {
            speak(`Congratulations! You completed the table of ${selectedTable}! You got ${score + 1} out of 10 correct.`);
          }, 1000);
        }
      }, 1500);
    } else {
      setShowFeedback('incorrect');
      setShakeButton(selectedAnswer);
      speak('Try again');
      
      setTimeout(() => {
        setShowFeedback(null);
        setShakeButton(null);
      }, 1000);
    }
  }, [problems, currentQuestion, score, selectedTable, speak]);

  // Return to home screen
  const goHome = useCallback(() => {
    setGameState('home');
    setSelectedTable(null);
    setShowFeedback(null);
    speak('Hello! I am your math buddy. Welcome back to the multiplication game! Choose a table to practice.');
  }, [speak]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'playing' && problems.length > 0) {
        const currentProblem = problems[currentQuestion];
        if (e.key >= '1' && e.key <= '4') {
          const answerIndex = parseInt(e.key) - 1;
          if (answerIndex < currentProblem.answers.length) {
            handleAnswer(currentProblem.answers[answerIndex]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, problems, currentQuestion, handleAnswer]);

  // Announce questions
  useEffect(() => {
    if (gameState === 'playing' && problems.length > 0) {
      const currentProblem = problems[currentQuestion];
      setTimeout(() => {
        speak(`Question ${currentQuestion + 1}: ${currentProblem.question.replace('×', 'times')}`);
      }, 100);
    }
  }, [currentQuestion, problems, gameState, speak]);

  // Home Screen
  if (gameState === 'home') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-mono">
        <div className="text-center max-w-2xl">
          {/* Friendly Monkey Character */}
          <div className="text-8xl mb-4 animate-bounce">
            🐵
          </div>
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            Multiplication Practice
          </h1>
          <p className="text-2xl text-gray-700 mb-12">
            Choose a multiplication table to practice
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((table) => (
              <button
                key={table}
                onClick={() => startGame(table)}
                onFocus={() => speak(`Table of ${table}`)}
                className="bg-white hover:bg-gray-200 focus:bg-gray-200 border-4 border-gray-400 hover:border-gray-600 focus:border-gray-600 rounded-xl p-6 text-3xl font-bold text-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gray-300"
                aria-label={`Practice table of ${table}`}
              >
                Table of {table}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => speak('Hello! I am your math buddy. Welcome to the multiplication game! First, choose a table to practice by clicking on one of the buttons. You will see 10 questions. For each question, pick the right answer by clicking on it or pressing number keys 1, 2, 3, or 4. I will cheer for you when you get it right!')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg text-xl font-semibold flex items-center gap-2 mx-auto focus:outline-none focus:ring-4 focus:ring-teal-300"
            aria-label="Listen to game instructions"
          >
            <Volume2 size={24} />
            🐵 Hear Instructions
          </button>
        </div>
      </div>
    );
  }

  // Game Screen
  if (gameState === 'playing' && problems.length > 0) {
    const currentProblem = problems[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-mono">
        <div className="w-full max-w-4xl">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="bg-gray-300 rounded-full h-4">
              <div 
                className="bg-teal-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
              ></div>
            </div>
            <p className="text-center text-xl text-gray-700 mt-2">
              Question {currentQuestion + 1} of 10 | Score: {score}
            </p>
          </div>

          {/* Monkey Character */}
          <div className="text-center mb-4">
            <div className="text-6xl animate-bounce">
              🐵
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-12">
            <h2 className="text-8xl font-bold text-gray-800 mb-4">
              {currentProblem.question} = ?
            </h2>
            <p className="text-2xl text-gray-700">
              Choose the correct answer (or press 1-4 on your keyboard)
            </p>
          </div>

          {/* Answer options */}
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            {currentProblem.answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(answer)}
                className={`
                  bg-white hover:bg-gray-200 focus:bg-gray-200 border-4 border-gray-400 hover:border-gray-600 focus:border-gray-600 
                  rounded-xl p-8 text-5xl font-bold text-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl 
                  focus:outline-none focus:ring-4 focus:ring-gray-300 relative
                  ${showFeedback === 'correct' && answer === currentProblem.correctAnswer ? 'bg-teal-100 border-teal-600 animate-pulse' : ''}
                  ${showFeedback === 'incorrect' && shakeButton === answer ? 'animate-bounce border-red-500 bg-red-100' : ''}
                `}
                aria-label={`Answer option ${index + 1}: ${answer}`}
                disabled={showFeedback !== null}
              >
                <span className="text-2xl text-gray-500 block mb-2">{index + 1}</span>
                {answer}
                {/* Jumping monkey when this is the correct answer being shown */}
                {showFeedback === 'correct' && answer === currentProblem.correctAnswer && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-4xl animate-bounce">
                    🐵
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback === 'correct' && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-teal-600 text-white text-4xl font-bold px-12 py-6 rounded-xl shadow-2xl animate-bounce flex items-center gap-4">
                <span className="text-5xl">🐵</span>
                ✨ Good Job! ✨
              </div>
            </div>
          )}

          {showFeedback === 'incorrect' && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-orange-500 text-white text-4xl font-bold px-12 py-6 rounded-xl shadow-2xl animate-pulse flex items-center gap-4">
                <span className="text-4xl">🤔</span>
                Try Again!
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Celebration Screen
  if (gameState === 'celebration') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-mono">
        <div className="text-center max-w-2xl">
          {/* Animated monkeys and stars */}
          <div className="flex justify-center mb-8">
            <div className="text-6xl animate-bounce mx-2">🐵</div>
            {[...Array(3)].map((_, i) => (
              <Star
                key={i}
                size={60}
                className="text-yellow-400 fill-yellow-400 animate-bounce mx-2"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
            <div className="text-6xl animate-bounce mx-2" style={{ animationDelay: '0.9s' }}>🐵</div>
          </div>

          <h1 className="text-7xl font-bold text-gray-800 mb-6 animate-pulse">
            Congratulations!
          </h1>
          
          <p className="text-3xl text-gray-700 mb-4">
            You completed the table of {selectedTable}!
          </p>
          
          <p className="text-4xl font-bold text-teal-600 mb-12">
            Score: {score} out of 10
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => startGame(selectedTable)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl text-2xl font-bold flex items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-300"
              aria-label="Play the same table again"
            >
              <RotateCcw size={28} />
              🐵 Play Again
            </button>
            
            <button
              onClick={goHome}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl text-2xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gray-300"
              aria-label="Go back to home screen to choose a different table"
            >
              Choose New Table
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MultiplicationGame;