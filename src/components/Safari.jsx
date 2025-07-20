import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

const Safari = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'waiting', 'feedback'
  const [currentAnimal, setCurrentAnimal] = useState(null);
  const [soundPosition, setSoundPosition] = useState(null); // 'left' or 'right'
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const pannerNodeRef = useRef(null);

  // Animal sounds data (using generated audio tones as placeholders)
  const animals = [
    { name: 'Lion', sound: 'roar', frequency: 150, duration: 1.5, description: 'mighty roar' },
    { name: 'Elephant', sound: 'trumpet', frequency: 100, duration: 2, description: 'deep trumpet' },
    { name: 'Monkey', sound: 'chatter', frequency: 800, duration: 1, description: 'playful chatter' },
    { name: 'Tiger', sound: 'growl', frequency: 120, duration: 1.8, description: 'fierce growl' },
    { name: 'Bird', sound: 'chirp', frequency: 2000, duration: 0.8, description: 'melodic chirp' },
    { name: 'Hippo', sound: 'grunt', frequency: 80, duration: 1.2, description: 'deep grunt' }
  ];

  // Initialize Audio Context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      pannerNodeRef.current = audioContextRef.current.createStereoPanner();
      
      gainNodeRef.current.connect(pannerNodeRef.current);
      pannerNodeRef.current.connect(audioContextRef.current.destination);
    }
  }, []);

  // Text-to-speech function
  const speak = useCallback((text, interrupt = false) => {
    if (interrupt) {
      speechSynthesis.cancel();
    }
    
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }, interrupt ? 100 : 0);
  }, []);

  // Generate animal sound using Web Audio API
  const playAnimalSound = useCallback((animal, position) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    
    // Set panning based on position (-1 = left, 1 = right)
    pannerNodeRef.current.pan.value = position === 'left' ? -0.8 : 0.8;
    
    oscillator.connect(envelope);
    envelope.connect(gainNodeRef.current);
    
    // Configure oscillator for animal-like sound
    oscillator.frequency.setValueAtTime(animal.frequency, ctx.currentTime);
    oscillator.type = animal.name === 'Bird' ? 'sine' : 'sawtooth';
    
    // Add some frequency modulation for more natural sound
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 5;
    lfoGain.gain.value = animal.frequency * 0.1;
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    
    // Envelope for natural attack and decay
    envelope.gain.setValueAtTime(0, ctx.currentTime);
    envelope.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    envelope.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + animal.duration * 0.7);
    envelope.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + animal.duration);
    
    oscillator.start(ctx.currentTime);
    lfo.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + animal.duration);
    lfo.stop(ctx.currentTime + animal.duration);
  }, []);

  // Start new round
  const startNewRound = useCallback(() => {
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const randomPosition = Math.random() < 0.5 ? 'left' : 'right';
    
    setCurrentAnimal(randomAnimal);
    setSoundPosition(randomPosition);
    setGameState('playing');
    
    // Announce the round
    speak(`Round ${round}. Listen carefully for the ${randomAnimal.name}'s ${randomAnimal.description}.`);
    
    // Play sound after announcement
    setTimeout(() => {
      playAnimalSound(randomAnimal, randomPosition);
      setGameState('waiting');
    }, 3000);
  }, [round, speak, playAnimalSound]);

  // Handle player guess
  const handleGuess = useCallback((guess) => {
    if (gameState !== 'waiting') return;
    
    setGameState('feedback');
    const correct = guess === soundPosition;
    
    if (correct) {
      setScore(score + 1);
      setStreak(streak + 1);
      speak(`Correct! The ${currentAnimal.name} was on the ${soundPosition}. Great listening!`);
      
      // Level up every 5 correct answers
      if ((score + 1) % 5 === 0) {
        setLevel(level + 1);
        setTimeout(() => {
          speak(`Excellent! You've reached level ${level + 1}!`);
        }, 2000);
      }
    } else {
      setStreak(0);
      speak(`Not quite right. The ${currentAnimal.name} was on the ${soundPosition}. Try the next one!`);
    }
    
    // Move to next round
    setTimeout(() => {
      setRound(round + 1);
      startNewRound();
    }, 4000);
  }, [gameState, soundPosition, currentAnimal, score, streak, level, round, speak, startNewRound]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (gameState === 'waiting') {
            handleGuess('left');
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (gameState === 'waiting') {
            handleGuess('right');
          }
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (gameState === 'menu') {
            startGame();
          } else if (gameState === 'playing' && currentAnimal) {
            // Replay current sound
            playAnimalSound(currentAnimal, soundPosition);
          }
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          restartGame();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          giveInstructions();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, handleGuess, currentAnimal, soundPosition]);

  const startGame = () => {
    initAudioContext();
    setGameStarted(true);
    setGameState('playing');
    setRound(1);
    setScore(0);
    setStreak(0);
    setLevel(1);
    startNewRound();
  };

  const restartGame = () => {
    speechSynthesis.cancel();
    setGameState('menu');
    setGameStarted(false);
    setScore(0);
    setRound(1);
    setLevel(1);
    setStreak(0);
    speak('Game restarted. Press Enter or Space to start a new adventure!');
  };

  const giveInstructions = () => {
    speak('Welcome to Sound Safari! Listen for animal sounds coming from the left or right. Press the left arrow key if you hear the sound from the left, or the right arrow key if you hear it from the right. Press Space or Enter to replay a sound. Press R to restart, or I for instructions. Good luck, safari explorer!', true);
  };

  // Initial instructions
  useEffect(() => {
    const timer = setTimeout(() => {
      speak('Welcome to Sound Safari! Press I for instructions, or Enter to start your audio adventure!');
    }, 1000);
    return () => clearTimeout(timer);
  }, [speak]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 font-mono">
      <div className="text-center max-w-2xl">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-4" aria-label="Sound Safari Game">
          🎵 Sound Safari 🦁
        </h1>
        <p className="text-lg mb-8 text-gray-300">
          An Audio Adventure Game
        </p>

        {/* Game Status */}
        {gameStarted && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8" role="status" aria-live="polite">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{score}</div>
                <div className="text-sm text-gray-300">Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{round}</div>
                <div className="text-sm text-gray-300">Round</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{level}</div>
                <div className="text-sm text-gray-300">Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">{streak}</div>
                <div className="text-sm text-gray-300">Streak</div>
              </div>
            </div>
          </div>
        )}

        {/* Current Game State */}
        <div className="bg-gray-800 p-8 rounded-lg mb-8">
          {gameState === 'menu' && (
            <div>
              <h2 className="text-2xl mb-4">Ready to explore?</h2>
              <p className="text-gray-300 mb-6">
                Listen for animal sounds and guess which direction they come from!
              </p>
            </div>
          )}

          {gameState === 'playing' && (
            <div>
              <h2 className="text-2xl mb-4">🎧 Listen Carefully...</h2>
              <p className="text-gray-300">
                Round {round} - Get ready to hear a {currentAnimal?.name}!
              </p>
            </div>
          )}

          {gameState === 'waiting' && (
            <div>
              <h2 className="text-2xl mb-4">🤔 Which Direction?</h2>
              <p className="text-gray-300 mb-4">
                Press ← LEFT or RIGHT → arrow key
              </p>
              <p className="text-sm text-gray-400">
                Press Space to replay the sound
              </p>
            </div>
          )}

          {gameState === 'feedback' && (
            <div>
              <h2 className="text-2xl mb-4">📝 Processing...</h2>
              <p className="text-gray-300">
                Next round coming up!
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {gameState === 'menu' && (
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg text-xl font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-green-300"
              aria-label="Start new game"
              autoFocus
            >
              <Play className="inline mr-2" size={24} />
              Start Safari (Enter)
            </button>
          )}

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={restartGame}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label="Restart game - Press R key"
            >
              <RotateCcw className="inline mr-2" size={20} />
              Restart (R)
            </button>

            <button
              onClick={giveInstructions}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300"
              aria-label="Hear instructions - Press I key"
            >
              <Volume2 className="inline mr-2" size={20} />
              Instructions (I)
            </button>
          </div>
        </div>

        {/* Keyboard Instructions */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg text-sm">
          <h3 className="font-bold mb-2">Keyboard Controls:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
            <div>• ← Left Arrow: Guess Left</div>
            <div>• → Right Arrow: Guess Right</div>
            <div>• Space/Enter: Start/Replay</div>
            <div>• R: Restart Game</div>
            <div>• I: Instructions</div>
          </div>
        </div>

        {/* Screen Reader Info */}
        <div className="sr-only" aria-live="assertive" role="status">
          {gameState === 'waiting' && currentAnimal && 
            `Listening for ${currentAnimal.name} sound. Use arrow keys to guess direction.`
          }
        </div>
      </div>
    </div>
  );
};

export default Safari;