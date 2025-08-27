// src/components/Layout/Sidebar.js
import React from 'react';
import { Home, Map, Upload } from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'maps', label: 'Maps', icon: Map },
    { id: 'upload', label: 'Upload Data', icon: Upload },
  ];

  return (
    <div className="w-64 bg-navy shadow-lg">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-2xl font-bold text-white">UDB</h1>
        <p className="text-gray-300 text-sm">Uganda Development Dashboard</p>
      </div>
      
      <nav className="mt-6">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-700 text-white border-r-2 border-blue-400'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <Icon className="mr-3" size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;