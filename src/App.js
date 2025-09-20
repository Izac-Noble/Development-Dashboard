// src/App.js - GENERIC VERSION
import React, { useState } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import Dashboard from './components/Dashboard/Dashboard';
// import Maps from './components/Maps/Maps';
// import UploadData from './components/Upload/UploadData';

const DevelopmentDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [backendStatus] = useState('connected'); // Simplified for now

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return (
          <div className="p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Analytics</h2>
            <p className="text-gray-300">Advanced analytics and trends coming soon...</p>
          </div>
        );
      case 'maps':
        return (
          <div className="p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Geographic Maps</h2>
            <p className="text-gray-300">Interactive country maps coming soon...</p>
          </div>
        );
      case 'compare':
        return (
          <div className="p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Country Comparison</h2>
            <p className="text-gray-300">Compare multiple countries side-by-side...</p>
          </div>
        );
      case 'upload':
        return (
          <div className="p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Data Sources</h2>
            <p className="text-gray-300">Manage and upload custom data sources...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <Header backendStatus={backendStatus} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            {renderContent()}
          </div>
          
          <Footer backendStatus={backendStatus} />
        </div>
      </div>
    </div>
  );
};

export default DevelopmentDashboard;