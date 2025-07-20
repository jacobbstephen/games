import React, { useState, useEffect } from 'react';

import { Volume2, VolumeX, RotateCcw, Star } from 'lucide-react';

const EmojiMatch = () => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Emotions with emoji representations
  const emotions = [
    { id: 'happy', name: 'Happy', emoji: '😊', color: '#FFD700' },
    { id: 'sad', name: 'Sad', emoji: '😢', color: '#4A90E2' },
    { id: 'angry', name: 'Angry', emoji: '😠', color: '#E74C3C' },
    { id: 'surprised', name: 'Surprised', emoji: '😲', color: '#9B59B6' },
    { id: 'excited', name: 'Excited', emoji: '🤩', color: '#E67E22' },
    { id: 'worried', name: 'Worried', emoji: '😟', color: '#95A5A6' }
  ];

  // Scenarios with correct emotion matches
  const scenarios = [
    { text: "Your friend gives you a special gift", correctEmotion: 'happy', id: 1 },
    { text: "Your favorite toy breaks", correctEmotion: 'sad', id: 2 },
    { text: "Someone takes your snack without asking", correctEmotion: 'angry', id: 3 },
    { text: "You hear a loud, unexpected noise", correctEmotion: 'surprised', id: 4 },
    { text: "You're going to your favorite place", correctEmotion: 'excited', id: 5 },
    { text: "You can't find your way home", correctEmotion: 'worried', id: 6 }
  ];

  const currentScenarioData = scenarios[currentScenario];

  // Voice narration function
  const speakText = (text) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  // Read scenario when it changes or voice is enabled
  useEffect(() => {
    if (voiceEnabled && currentScenarioData) {
      setTimeout(() => speakText(currentScenarioData.text), 500);
    }
  }, [currentScenario, voiceEnabled]);

  const handleEmotionSelect = (emotionId) => {
    setSelectedEmotion(emotionId);
    
    if (emotionId === currentScenarioData.correctEmotion) {
      setFeedback('correct');
      setScore(score + 1);
      speakText('Well done! That\'s correct!');
      
      setTimeout(() => {
        if (currentScenario < scenarios.length - 1) {
          setCurrentScenario(currentScenario + 1);
          setSelectedEmotion(null);
          setFeedback('');
        } else {
          setGameCompleted(true);
          speakText('Congratulations! You completed all the scenarios!');
        }
      }, 2000);
    } else {
      setFeedback('incorrect');
      speakText('Try again! Think about how you would feel.');
      setTimeout(() => {
        setFeedback('');
        setSelectedEmotion(null);
      }, 2000);
    }
  };

  const restartGame = () => {
    setCurrentScenario(0);
    setSelectedEmotion(null);
    setFeedback('');
    setScore(0);
    setGameCompleted(false);
    speakText('Game restarted! Let\'s match emotions to scenarios.');
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      speakText('Voice narration turned on');
    }
  };

  const progressPercentage = ((currentScenario + (feedback === 'correct' ? 1 : 0)) / scenarios.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            EmotiMatch Game 🎯
          </h1>
          <p className="text-lg text-gray-600">Match the emotion to the scenario!</p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <button
            onClick={toggleVoice}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
            tabIndex={1}
            aria-label={voiceEnabled ? 'Turn off voice narration' : 'Turn on voice narration'}
          >
            {voiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </button>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700">
              Score: {score} / {scenarios.length}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(score)].map((_, i) => (
                <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
              ))}
            </div>
          </div>

          <button
            onClick={restartGame}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-green-300"
            tabIndex={2}
            aria-label="Restart game"
          >
            <RotateCcw size={24} />
            Restart
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Game Completed Screen */}
        {gameCompleted && (
          <div className="text-center bg-white rounded-xl p-8 shadow-lg mb-6 border-4 border-green-400">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">Congratulations!</h2>
            <p className="text-xl text-gray-700 mb-4">
              You matched all emotions correctly! You scored {score} out of {scenarios.length}!
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(score)].map((_, i) => (
                <Star key={i} className="text-yellow-400 fill-yellow-400" size={32} />
              ))}
            </div>
          </div>
        )}

        {/* Game Content */}
        {!gameCompleted && (
          <div className="space-y-8">
            {/* Scenario Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-4 border-blue-300">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Scenario {currentScenario + 1} of {scenarios.length}
                </h2>
                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <p className="text-xl text-gray-800 leading-relaxed" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    {currentScenarioData.text}
                  </p>
                  <button
                    onClick={() => speakText(currentScenarioData.text)}
                    className="mt-4 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
                    tabIndex={3}
                    aria-label="Read scenario aloud"
                  >
                    🔊 Read Again
                  </button>
                </div>
              </div>
            </div>

            {/* Emotion Selection */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-4 border-purple-300">
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                How would you feel?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {emotions.map((emotion, index) => (
                  <button
                    key={emotion.id}
                    onClick={() => handleEmotionSelect(emotion.id)}
                    className={`p-6 rounded-xl border-4 text-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300 ${
                      selectedEmotion === emotion.id
                        ? feedback === 'correct'
                          ? 'border-green-500 bg-green-100 scale-105'
                          : feedback === 'incorrect'
                          ? 'border-red-500 bg-red-100'
                          : 'border-purple-500 bg-purple-100'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:scale-105'
                    }`}
                    style={{ 
                      borderColor: selectedEmotion === emotion.id ? emotion.color : undefined,
                      backgroundColor: selectedEmotion === emotion.id ? `${emotion.color}20` : undefined
                    }}
                    tabIndex={4 + index}
                    aria-label={`Select ${emotion.name} emotion`}
                    disabled={selectedEmotion !== null}
                  >
                    <div className="text-6xl mb-3">{emotion.emoji}</div>
                    <div className="text-lg font-semibold text-gray-800">{emotion.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`text-center p-6 rounded-xl border-4 ${
                feedback === 'correct' 
                  ? 'bg-green-100 border-green-400' 
                  : 'bg-yellow-100 border-yellow-400'
              }`}>
                <div className="text-4xl mb-2">
                  {feedback === 'correct' ? '✅' : '🤔'}
                </div>
                <p className="text-2xl font-bold">
                  {feedback === 'correct' ? 'Well done! That\'s correct!' : 'Try again! Think about how you would feel.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiMatch;