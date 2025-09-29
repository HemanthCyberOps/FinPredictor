import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Goals from './pages/Goals';
import AIInsights from './pages/AIInsights';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/ai-insights" element={<AIInsights />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
