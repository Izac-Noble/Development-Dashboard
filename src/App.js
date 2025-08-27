import React, { useState } from 'react';
import Header from './components/Layout/header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import Dashboard from './components/Dashboard/Dashboard';
import Maps from './components/Maps/Maps';
import UploadData from './components/Upload/UploadData';
import useApiData from './hooks/useApiData';

const UgandaDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const apiData = useApiData();

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard {...apiData} />;
      case 'maps':
        return <Maps />;
      case 'upload':
        return <UploadData {...apiData} />;
      default:
        return <Dashboard {...apiData} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <Header backendStatus={apiData.backendStatus} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            {renderContent()}
          </div>
          
          <Footer backendStatus={apiData.backendStatus} />
        </div>
      </div>
    </div>
  );
};

export default UgandaDashboard;