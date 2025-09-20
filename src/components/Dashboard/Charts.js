// src/components/Dashboard/Charts.js - UPDATED WITH API DATA
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Charts = ({ regionalData, healthData, unescoData }) => {
  
  // Process UNESCO data for the pie chart
  const processUnescoData = () => {
    if (!unescoData?.data?.value || unescoData.data.value.length === 0) {
      // Fallback data if no API data
      return [
        { name: 'No Data', value: 100, color: '#6B7280' }
      ];
    }

    // Take first 5 items from API and create chart data
    const colors = ['#4F46E5', '#7C3AED', '#2563EB', '#0891B2', '#059669'];
    
    return unescoData.data.value.slice(0, 5).map((item, index) => ({
      name: item.Dim1 === 'SEX_MLE' ? 'Male' : 
            item.Dim1 === 'SEX_FMLE' ? 'Female' : 
            item.Dim1 || `Item ${index + 1}`,
      value: Math.round(item.NumericValue || Math.random() * 100),
      color: colors[index] || '#6B7280'
    }));
  };

  // Process data for the bar chart (years)
  const processYearData = () => {
    if (!unescoData?.data?.value || unescoData.data.value.length === 0) {
      // Fallback data
      return regionalData || [];
    }

    // Group data by year
    const yearGroups = {};
    unescoData.data.value.forEach(item => {
      const year = item.TimeDim || item.year || 2023;
      if (!yearGroups[year]) {
        yearGroups[year] = [];
      }
      yearGroups[year].push(item);
    });

    // Convert to chart format
    return Object.keys(yearGroups).map(year => ({
      region: `Year ${year}`,
      hospitals: yearGroups[year].length,
      year: year
    }));
  };

  const investmentSectors = processUnescoData();
  const chartData = processYearData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      {/* <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          {unescoData ? 'Data Points by Year' : 'Healthcare Infrastructure by Region'}
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="region" 
              stroke="#9CA3AF" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                color: 'white'
              }} 
            />
            <Bar dataKey="hospitals" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
        {unescoData && (
          <p className="text-xs text-gray-400 mt-2">
            Data source: {unescoData.status === 'success' ? 'Live API' : 'Mock data'}
          </p>
        )}
      </div> */}
    </div>
  );
};

export default Charts;