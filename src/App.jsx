// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameMenu from './components/GameMenu';
import MultiplicationGame from './components/MultiplicationGame';
import Emoji from './components/EmojiMatch';
import ColorMatchingGame from './components/ColorMatchingGame';

function App() {
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameMenu onGameSelect={(gameId) => setSelectedGame(gameId)} />} />

        <Route path="/emoji" element={<Emoji />} />
        <Route path="/colors" element={<ColorMatchingGame />} />
        <Route path="/multiply" element={<MultiplicationGame />} />
      </Routes>
    </Router>
  );
}

export default App;
