import React from 'react';
import AIInsightCard from '../components/AIInsightCard';

function AIInsights() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">AI Insights</h2>
      <p className="text-gray-600">Get predictive insights for your portfolio and goals.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AIInsightCard />
        <AIInsightCard />
      </div>
    </div>
  );
}

export default AIInsights;
