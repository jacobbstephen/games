import React, { useState, useEffect, useRef } from 'react';
import { Volume2, RotateCcw, Play, Headphones } from 'lucide-react';

const ColorMatchingGame = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentColor, setCurrentColor] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const colorIndexRef = useRef(0);
const lastLevelRef = useRef(currentLevel);


  // Color sets for different levels
  const colorSets = {
    1: [
      { name: 'red', color: '#FF4444', hex: '#FF4444' },
      { name: 'blue', color: '#4444FF', hex: '#4444FF' },
      { name: 'yellow', color: '#FFD700', hex: '#FFD700' }
    ],
    2: [
      { name: 'red', color: '#FF4444', hex: '#FF4444' },
      { name: 'blue', color: '#4444FF', hex: '#4444FF' },
      { name: 'yellow', color: '#FFD700', hex: '#FFD700' },
      { name: 'green', color: '#44AA44', hex: '#44AA44' },
      { name: 'orange', color: '#FF8800', hex: '#FF8800' }
    ],
    3: [
      { name: 'red', color: '#FF4444', hex: '#FF4444' },
      { name: 'blue', color: '#4444FF', hex: '#4444FF' },
      { name: 'yellow', color: '#FFD700', hex: '#FFD700' },
      { name: 'green', color: '#44AA44', hex: '#44AA44' },
      { name: 'orange', color: '#FF8800', hex: '#FF8800' },
      { name: 'purple', color: '#AA44AA', hex: '#AA44AA' },
      { name: 'pink', color: '#FF69B4', hex: '#FF69B4' }
    ]
  };

  const speak = (text, rate = 0.8) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

 const getRandomColor = () => {
  if (currentLevel !== lastLevelRef.current) {
    colorIndexRef.current = 0;
    lastLevelRef.current = currentLevel;
  }

  const colors = colorSets[currentLevel];
  const selected = colors[colorIndexRef.current];
  colorIndexRef.current = (colorIndexRef.current + 1) % colors.length;
  return selected;
};


  const startNewRound = () => {
    const newColor = getRandomColor();
    setCurrentColor(newColor.name);
    setFeedback('');
    
    setTimeout(() => {
      speak(`Find the ${newColor.name} color`);
    }, 500);
  };

  const handleColorClick = (clickedColorName) => {
    if (clickedColorName === currentColor) {
      setScore(score + 1);
      setFeedback('correct');
      speak('Well done! Great job!');
      
      setTimeout(() => {
        if (score > 0 && (score + 1) % 5 === 0 && currentLevel < 3) {
          setCurrentLevel(currentLevel + 1);
          speak(`Level up! Now trying level ${currentLevel + 1}!`);
          setTimeout(startNewRound, 2000);
        } else {
          startNewRound();
        }
      }, 2000);
    } else {
      setFeedback('incorrect');
      speak('Try again! You can do it!');
      setTimeout(() => setFeedback(''), 1500);
    }
  };

  const repeatInstruction = () => {
    if (currentColor) {
      speak(`Find the ${currentColor} color`);
    }
  };

  const resetGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setCurrentColor('');
    setFeedback('');
    setGameStarted(false);
  };

  const startGame = () => {
    setGameStarted(true);
    speak('Welcome to the color matching game! Listen carefully and tap the right color.');
    setTimeout(startNewRound, 3000);
  };

  useEffect(() => {
    if (gameStarted && !currentColor) {
      startNewRound();
    }
  }, [currentLevel]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <Headphones className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Color Match Game</h1>
            <p className="text-lg text-gray-600 mb-4">🎧 Please use headphones for the best experience</p>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-4">Listen to the color name and tap the matching color block!</p>
            <div className="flex justify-center space-x-2 mb-4">
              {['#FF4444', '#4444FF', '#FFD700'].map((color, index) => (
                <div
                  key={index}
                  className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-4 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center justify-center mx-auto"
          >
            <Play className="w-6 h-6 mr-2" />
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-gray-800">Level {currentLevel}</div>
              <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold">
                Score: {score}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={repeatInstruction}
                className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
                disabled={!currentColor}
              >
                <Volume2 className="w-6 h-6" />
              </button>
              
              <button
                onClick={resetGame}
                className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Instruction */}
        {currentColor && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Find the <span className="text-blue-600">{currentColor}</span> color
            </h2>
            <p className="text-gray-600">Tap the color block that matches!</p>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="mb-6 text-center">
            <div
              className={`inline-block px-8 py-4 rounded-full text-2xl font-bold ${
                feedback === 'correct'
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-400 text-white'
              }`}
            >
              {feedback === 'correct' ? '🎉 Well Done!' : '💪 Try Again!'}
            </div>
          </div>
        )}

        {/* Color Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {colorSets[currentLevel].map((colorItem, index) => (
            <button
              key={index}
              onClick={() => handleColorClick(colorItem.name)}
              disabled={feedback === 'correct'}
              className={`
                aspect-square rounded-3xl shadow-xl transform transition-all duration-300 hover:scale-105 active:scale-95 border-4 border-white
                ${feedback === 'correct' && colorItem.name === currentColor ? 'ring-8 ring-green-400' : ''}
                ${feedback === 'incorrect' && colorItem.name === currentColor ? 'ring-8 ring-orange-400' : ''}
                disabled:cursor-not-allowed
              `}
              style={{ backgroundColor: colorItem.color }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white font-bold text-lg md:text-xl bg-black bg-opacity-20 px-3 py-1 rounded-full">
                  {colorItem.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-4">
          <div className="text-center text-gray-600 mb-2">
            Progress to next level: {score % 5}/5
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(score % 5) * 20}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorMatchingGame;