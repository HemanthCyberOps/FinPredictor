import React from 'react';
import PortfolioCard from '../components/PortfolioCard';

function Portfolio() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Portfolio</h2>
      <p className="text-gray-600">Add or track your assets here.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards */}
        <PortfolioCard />
        <PortfolioCard />
        <PortfolioCard />
      </div>
    </div>
  );
}

export default Portfolio;
