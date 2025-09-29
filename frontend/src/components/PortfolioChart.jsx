import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function PortfolioChart() {
  // Demo data
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Portfolio Value (₹)',
        data: [100000, 105000, 110000, 120000, 130000, 140000],
        borderColor: 'rgba(59, 130, 246, 1)', // Tailwind blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Portfolio Growth Over Time',
        font: { size: 18 },
      },
    },
  };

  return <Line data={data} options={options} />;
}

export default PortfolioChart;
