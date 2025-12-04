import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import UglyPage from './pages/quests/UglyPage';
import CyberCrawler from './pages/quests/CyberCrawler';

import KonamiHandler from './components/KonamiHandler';
import MusicVisualizer from './pages/MusicVisualizer';
import RubeGoldberg from './pages/quests/RubeGoldberg';
import BadPhone from './pages/quests/BadPhone';
import SnakeGame from './pages/quests/SnakeGame';
import NirdTools from './pages/NirdTools';

const Layout = () => {
  const location = useLocation();
  const isSnakeGame = location.pathname === '/quests/snake';

  return (
    <>
      {!isSnakeGame && (
        <header>
          <div className="container">
            <nav>
              <Link to="/" className="logo">N2I 2025</Link>
              <div>
                <Link to="/" style={{ marginRight: '1rem', color: 'var(--text-primary)' }}>Accueil</Link>
                <Link to="/music-visualizer" style={{ marginRight: '1rem', color: 'var(--text-primary)' }}>Visualizer</Link>
              </div>
            </nav>
          </div>
        </header>
      )}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quests/ugly" element={<UglyPage />} />
          <Route path="/quests/pixel-game" element={<CyberCrawler />} />
          <Route path="/quests/rube-goldberg" element={<RubeGoldberg />} />
          <Route path="/quests/bad-phone" element={<BadPhone />} />
          <Route path="/quests/snake" element={<SnakeGame />} />
          <Route path="/nird-tools" element={<NirdTools />} />

          <Route path="/music-visualizer" element={<MusicVisualizer />} />
        </Routes>
      </main>

      {!isSnakeGame && (
        <footer style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          <p>Nuit de l'Info 2025 - LES RETRAITÉS</p>
        </footer>
      )}
    </>
  );
};

function App() {
  return (
    <Router>
      <KonamiHandler />
      <Layout />
    </Router>
  );
}

export default App;
