// src/components/Layout/Header.js
import React from 'react';
import { Bell, Settings, User, Search, Calendar, Globe } from 'lucide-react';

const Header = ({ backendStatus }) => {
  return (
    <header className="bg-navy border-b border-blue-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Globe className="text-blue-400 mr-2" size={24} />
          <span className="text-white font-semibold">Uganda Education Portal</span>
        </div>
        <div className="hidden md:flex items-center bg-gray-700 rounded-lg px-3 py-2">
          <Search className="text-gray-400 mr-2" size={16} />
          <input 
            type="text" 
            placeholder="Search education data..." 
            className="bg-transparent text-white text-sm outline-none placeholder-gray-400"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center text-gray-300 text-sm">
          <Calendar className="mr-2" size={16} />
          <span>UNESCO Institute for Statistics</span>
        </div>
        <button className="relative p-2 text-gray-300 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
        </button>
        <button className="p-2 text-gray-300 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors">
          <User size={16} />
          <span className="text-white text-sm hidden md:inline">Admin</span>
        </button>
      </div>
    </header>
  );
};

export default Header;