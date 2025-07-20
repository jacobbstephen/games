// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameMenu from './components/GameMenu';
import MathGame from './components/MultiplicationGame'; 
import Safari from './components/Safari';
import Emoji from './components/EmotiMatch';

function App() {
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameMenu onGameSelect={(gameId) => setSelectedGame(gameId)} />} />
        <Route path="/maths" element={<MathGame />} />
        <Route path="/emoji" element={<Emoji />} />
        <Route path="/safari" element={<Safari />} />
        {/* Add other routes here later like emoji, safari, etc. */}
      </Routes>
    </Router>
  );
}

export default App;
