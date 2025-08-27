// src/components/Layout/Footer.js
import React from 'react';
import { Download, RefreshCw } from 'lucide-react';

const Footer = ({ backendStatus }) => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 px-6 py-4">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <div className="flex items-center space-x-6 text-sm text-gray-400">
          <span>© 2025 Uganda Development Dashboard</span>
          <span className="hidden md:inline">|</span>
          <div className="flex items-center space-x-4">
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <button className="hover:text-white transition-colors">Terms of Service</button>
            <button className="hover:text-white transition-colors">Data Sources</button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-400">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              backendStatus === 'connected' ? 'bg-green-500' : 
              backendStatus === 'disconnected' ? 'bg-red-500' : 
              'bg-yellow-500'
            }`}></div>
            <span>
              Backend Status: {
                backendStatus === 'connected' ? 'Connected' :
                backendStatus === 'disconnected' ? 'Disconnected' :
                'Checking...'
              }
            </span>
          </div>
          <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors">
            <Download size={14} />
            <span>Export Report</span>
          </button>
          <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors">
            <RefreshCw size={14} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;