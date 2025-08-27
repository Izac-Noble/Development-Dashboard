// src/components/Dashboard/Charts.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Charts = ({ regionalData }) => {
  const investmentSectors = [
    { name: 'Agriculture', value: 35, color: '#4F46E5' },
    { name: 'Manufacturing', value: 25, color: '#7C3AED' },
    { name: 'Services', value: 20, color: '#2563EB' },
    { name: 'Technology', value: 12, color: '#0891B2' },
    { name: 'Mining', value: 8, color: '#059669' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Healthcare Infrastructure by Region</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={regionalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="region" stroke="#9CA3AF" />
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
      </div>

      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Investment Opportunities</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={investmentSectors}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
            >
              {investmentSectors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                color: 'white'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {investmentSectors.map((sector, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: sector.color }}
              />
              <span className="text-sm text-gray-300">{sector.name} ({sector.value}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Charts;