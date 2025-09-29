import React from 'react';

function PortfolioCard() {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800">Mutual Fund: ABC Growth</h3>
      <p className="text-gray-600 mt-2">Current Value: ₹1,20,000</p>
      <p className="text-gray-600 mt-1">Invested: ₹1,00,000</p>
      <p className="text-green-600 mt-1 font-medium">Profit: ₹20,000 (20%)</p>
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        View Details
      </button>
    </div>
  );
}

export default PortfolioCard;
