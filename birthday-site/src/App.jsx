import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import Reasons from './components/Reasons';
import Future from './components/Future';
import Travel from './components/Travel';
import TripDetail from './components/TripDetail';
import HallOfFame from './components/HallOfFame';
import BucketList from './components/BucketList';
import Goals from './components/Goals';
import Surprise from './components/Surprise';
import './App.css';

function App() {
  const [showSurprise, setShowSurprise] = useState(true);

  if (showSurprise) {
    return <Surprise onUnlock={() => setShowSurprise(false)} />;
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/story" element={<Timeline />} />
            <Route path="/travel" element={<Travel />} />
            <Route path="/travel/:id" element={<TripDetail />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="/reasons" element={<Reasons />} />
            <Route path="/bucket-list" element={<BucketList />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/future" element={<Future />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

