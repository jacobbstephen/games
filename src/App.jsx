// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameMenu from './components/GameMenu';
import MultiplicationGame from './components/MultiplicationGame';
import Safari from './components/Safari';
import Emoji from './components/EmojiMatch';
import ColorMatchingGame from './components/ColorMatchingGame';

function App() {
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameMenu onGameSelect={(gameId) => setSelectedGame(gameId)} />} />

        <Route path="/emoji" element={<Emoji />} />
        {/* <Route path="/safari" element={<Safari />} />  */}
        <Route path="/colors" element={<ColorMatchingGame />} />
        <Route path="/multiply" element={<MultiplicationGame />} />
        {/* Add other routes here later like emoji, safari, etc. */}
      </Routes>
    </Router>
  );
}

export default App;
