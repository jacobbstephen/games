import React, { useState, useCallback } from 'react';
import { Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GameMenu = ({ onGameSelect }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const navigate = useNavigate();

  // Text-to-speech function
  const speak = useCallback((text, rate = 1) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Game selection logic
  const handleGameSelect = (gameName, gameId) => {
    const selected = games.find(g => g.id === gameId);
    if (!selected?.available) {
      speak('This game is coming soon!');
      return;
    }

    setSelectedGame(gameName);
    speak(`Starting ${gameName}!`);

    setTimeout(() => {
      if (onGameSelect) onGameSelect(gameId);
      navigate(`/${gameId}`); // Route to that game's component
    }, 1500);
  };

  // List of games
  const games = [

  {
    id: 'emoji',
    name: 'Emoji Match',
    icon: '😊',
    character: '🦄',
    description: 'Match emotions and feelings with colorful emojis',
    color: 'purple',
    available: true
  },
  {
    id: 'safari',
    name: 'Safari Game',
    icon: '🦁',
    character: '🐘',
    description: 'Explore animals and learn about wildlife',
    color: 'green',
    available: true
  },
  {
    id: 'colors',
    name: 'Color Match',
    icon: '🎨',
    character: '🐦',
    description: 'Match spoken color names to the correct color blocks',
    color: 'pink',
    available: true
  }
];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-mono">
      <div className="text-center max-w-4xl w-full">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="text-6xl animate-bounce">🎮</div>
            <h1 className="text-6xl font-bold text-gray-800">Learning Games</h1>
            <div className="text-6xl animate-bounce" style={{ animationDelay: '0.5s' }}>🌟</div>
          </div>

          <p className="text-2xl text-gray-700 mb-6">
            Choose a fun game to play and learn!
          </p>

          <button
            onClick={() =>
              speak(
                'Hello! Welcome to our learning games! You can choose from three amazing games. The Maths Game helps you learn multiplication with a friendly monkey. Emoji Match teaches about feelings with a magical unicorn. Safari Game lets you explore animals with an elephant guide. Click on any game to start playing!'
              )
            }
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-xl font-semibold flex items-center gap-2 mx-auto mb-8 focus:outline-none focus:ring-4 focus:ring-gray-300"
            aria-label="Listen to welcome message and game descriptions"
          >
            <Volume2 size={24} />
            🎮 Hear About Games
          </button>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {games.map((game) => (
  <div
    key={game.id}
    className={`relative bg-white rounded-2xl shadow-lg border-4 border-gray-400 overflow-hidden
      ${selectedGame === game.name ? 'animate-pulse border-yellow-400 bg-yellow-50' : ''}
      ${!game.available ? 'opacity-75' : ''}`}
  >
    <button
      onClick={() =>
        game.available
          ? handleGameSelect(game.name, game.id)
          : speak('This game is coming soon!')
      }
      onFocus={() => speak(`${game.name}. ${game.description}`)}
      className={`w-full p-8 text-center transition-all duration-300 focus:outline-none
        ${game.available ? 'hover:bg-gray-50 focus:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'}`}
      aria-label={`${game.name}: ${game.description}${!game.available ? ' - Coming soon' : ''}`}
      disabled={!game.available}
    >
      <div className="mb-6 flex justify-center items-center gap-4">
        <div className="text-6xl animate-bounce">{game.character}</div>
        <div className="text-8xl">{game.icon}</div>
      </div>

      <h2 className={`text-4xl font-bold mb-4 ${
        game.color === 'teal' ? 'text-teal-600' :
        game.color === 'purple' ? 'text-purple-600' :
        game.color === 'green' ? 'text-green-600' :
        game.color === 'pink' ? 'text-pink-600' :
        ''
      } ${!game.available ? 'text-gray-500' : ''}`}>
        {game.name}
      </h2>

      <p className={`text-xl mb-6 ${!game.available ? 'text-gray-500' : 'text-gray-700'}`}>
        {game.description}
      </p>

      {game.available ? (
        <div className={`inline-block px-6 py-2 rounded-full text-white font-semibold text-lg ${
          game.color === 'teal' ? 'bg-teal-600' :
          game.color === 'purple' ? 'bg-purple-600' :
          game.color === 'green' ? 'bg-green-600' :
          game.color === 'pink' ? 'bg-pink-600' :
          'bg-gray-600'
        }`}>
          ▶️ Play Now!
        </div>
      ) : (
        <div className="inline-block px-6 py-2 rounded-full bg-gray-400 text-white font-semibold text-lg">
          🔜 Coming Soon
        </div>
      )}
    </button>

    {/* Selection Feedback */}
    {selectedGame === game.name && (
      <div className="absolute inset-0 flex items-center justify-center bg-yellow-200 bg-opacity-90 pointer-events-none">
        <div className="text-6xl animate-bounce">✨</div>
        <div className="text-4xl font-bold text-gray-800 mx-4">Selected!</div>
        <div className="text-6xl animate-bounce">✨</div>
      </div>
    )}

    {/* Coming Soon Badge */}
    {!game.available && (
      <div className="absolute top-4 right-4">
        <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Soon!
        </div>
      </div>
    )}
  </div>
))}

        </div>

        {/* Bottom Section */}
        <div className="mt-12">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="text-4xl">🏆</div>
            <p className="text-xl text-gray-600">
              More games are being created just for you!
            </p>
            <div className="text-4xl">🎯</div>
          </div>

          <button
            onClick={() =>
              speak(
                'We are working hard to bring you more amazing games! The Emoji Match game will help you learn about different feelings and emotions. The Safari game will take you on an adventure to learn about wild animals from around the world. Stay tuned!'
              )
            }
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg text-lg font-semibold flex items-center gap-2 mx-auto focus:outline-none focus:ring-4 focus:ring-orange-300"
            aria-label="Learn about upcoming games"
          >
            <Volume2 size={20} />
            🔜 About New Games
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
