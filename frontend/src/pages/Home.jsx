import React from 'react';
import PortfolioCard from '../components/PortfolioCard';
import GoalCard from '../components/GoalCard';
import AIInsightCard from '../components/AIInsightCard';

function Home() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PortfolioCard />
        <GoalCard />
        <AIInsightCard />
      </div>
    </div>
  );
}

export default Home;
