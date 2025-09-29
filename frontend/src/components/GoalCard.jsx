import React from 'react';

function GoalCard() {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800">Buy a House</h3>
      <p className="text-gray-600 mt-2">Target: ₹50,00,000</p>
      <p className="text-gray-600 mt-1">Timeframe: 10 years</p>
      <p className="text-green-600 mt-1 font-medium">Progress: 20%</p>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }}></div>
      </div>
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Update Goal
      </button>
    </div>
  );
}

export default GoalCard;
