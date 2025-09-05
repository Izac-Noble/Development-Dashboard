// src/components/Dashboard/Charts.js
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import apiService from '../../services/api';

const Charts = ({ educationData, indicators, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Process data for category distribution pie chart
  const categoryData = useMemo(() => {
    if (!categories?.categories) return [];
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];
    
    return Object.entries(categories.categories).map(([category, count], index) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      color: colors[index % colors.length]
    }));
  }, [categories]);

  // Process data for indicators by year
  const yearlyData = useMemo(() => {
    if (!educationData?.data) return [];
    
    const yearCounts = {};
    educationData.data.forEach(item => {
      const year = item.year;
      if (year && year !== 'N/A') {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });
    
    return Object.entries(yearCounts)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year)
      .slice(-10); // Last 10 years
  }, [educationData]);

  // Process data for top indicators
  const topIndicators = useMemo(() => {
    if (!educationData?.data) return [];
    
    // Group by indicator and get latest values
    const indicatorGroups = {};
    educationData.data.forEach(item => {
      if (item.value !== null && item.value !== undefined) {
        const key = item.indicator_name || item.indicator_id;
        if (!indicatorGroups[key] || parseInt(item.year) > parseInt(indicatorGroups[key].year)) {
          indicatorGroups[key] = {
            name: key.length > 30 ? key.substring(0, 30) + '...' : key,
            value: typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0,
            year: item.year,
            unit: item.unit,
            category: item.category
          };
        }
      }
    });
    
    return Object.values(indicatorGroups)
      .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [educationData, selectedCategory]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 shadow-lg">
          <p className="text-white font-semibold">{label}</p>
          <p className="text-blue-400">
            {data.dataKey}: {typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {categories?.categories && Object.keys(categories.categories).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm transition-colors capitalize ${
                selectedCategory === category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category} ({categories.categories[category]})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Indicators by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  color: 'white',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Data Points by Year */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Data Points by Year</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Indicators Chart */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Top Indicators {selectedCategory !== 'all' && `(${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)})`}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topIndicators} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9CA3AF" />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#9CA3AF" 
              width={200}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#10B981"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Summary Table */}
      {educationData?.data && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Data Points</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                <tr>
                  <th className="px-4 py-3">Indicator</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Unit</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {educationData.data
                  .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
                  .slice(0, 10)
                  .map((item, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className="max-w-xs truncate" title={item.indicator_name}>
                          {item.indicator_name || item.indicator_id}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs capitalize ${
                          apiService.getCategoryColor(item.category) === 'blue' ? 'bg-blue-900 text-blue-300' :
                          apiService.getCategoryColor(item.category) === 'green' ? 'bg-green-900 text-green-300' :
                          apiService.getCategoryColor(item.category) === 'purple' ? 'bg-purple-900 text-purple-300' :
                          apiService.getCategoryColor(item.category) === 'yellow' ? 'bg-yellow-900 text-yellow-300' :
                          apiService.getCategoryColor(item.category) === 'red' ? 'bg-red-900 text-red-300' :
                          'bg-gray-900 text-gray-300'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.year}</td>
                      <td className="px-4 py-3 font-mono">
                        {apiService.formatEducationValue(item.value, item.unit)}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{item.unit || 'N/A'}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Charts;