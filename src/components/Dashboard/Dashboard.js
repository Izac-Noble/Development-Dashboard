// In src/components/Dashboard/Dashboard.js
import React from 'react';
import { useUgandaHealth, useHealthSummary } from '../../hooks/useApiData';
import StatsCards from './StatsCards';
import Charts from './Charts';

const Dashboard = () => {
  const { data: healthData, loading: healthLoading, error: healthError } = useUgandaHealth();
  const { data: summaryData, loading: summaryLoading, error: summaryError } = useHealthSummary();

  if (healthLoading || summaryLoading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  if (healthError || summaryError) {
    return <div className="p-4 text-red-600">Error loading data: {healthError?.message || summaryError?.message}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Uganda Health Dashboard</h1>
      
      <StatsCards summaryData={summaryData} />
      <Charts healthData={healthData} />
    </div>
  );
};

export default Dashboard;