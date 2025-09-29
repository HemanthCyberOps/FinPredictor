import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">FinPredictor</h1>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/portfolio" className="hover:underline">Portfolio</Link>
          <Link to="/goals" className="hover:underline">Goals</Link>
          <Link to="/ai-insights" className="hover:underline">AI Insights</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
