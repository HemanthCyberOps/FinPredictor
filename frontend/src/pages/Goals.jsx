import React from 'react';
import GoalCard from '../components/GoalCard';
import GoalChart from '../components/GoalChart';

function Goals() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Financial Goals</h2>
      <p className="text-gray-600">Plan your goals, investments, and expected returns.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GoalCard />
        <GoalCard />
      </div>

      <div className="mt-6 bg-white p-6 shadow-md rounded-lg">
        <GoalChart />
      </div>
    </div>
  );
}

export default Goals;
