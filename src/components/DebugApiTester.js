// src/components/DebugApiTester.js - TEST COMPONENT
import React, { useState } from 'react';
import { useApi, buildApiUrl } from '../services/api';

const DebugApiTester = () => {
  const [selectedCountry, setSelectedCountry] = useState('UGA');
  const [selectedApi, setSelectedApi] = useState('countryInfo');
  
  // Build the URL based on selection
  const getTestUrl = () => {
    switch (selectedApi) {
      case 'countryInfo':
        return buildApiUrl.countryInfo(selectedCountry);
      case 'unesco':
        return buildApiUrl.unesco(selectedCountry, ['CR.1']);
      case 'who':
        return buildApiUrl.who(selectedCountry);
      case 'worldBank':
        return buildApiUrl.worldBank(selectedCountry, 'SP.POP.TOTL');
      default:
        return '';
    }
  };

  const testUrl = getTestUrl();
  const { data, loading, error, refetch } = useApi(testUrl);

  const apiOptions = [
    { value: 'countryInfo', label: 'Country Info (RestCountries)' },
    { value: 'unesco', label: 'UNESCO Education Data' },
    { value: 'who', label: 'WHO Health Data' },
    { value: 'worldBank', label: 'World Bank Economic Data' }
  ];

  const countryOptions = ['UGA', 'USA', 'GBR', 'KEN', 'DEU', 'JPN', 'FRA', 'BRA', 
                            'IND', 'AUS', 'CAN', 'ZAF', 'NGA', 'EGY', 'TZA'];

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">API Debug Tester</h2>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Country Code
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
          >
            {countryOptions.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            API Source
          </label>
          <select
            value={selectedApi}
            onChange={(e) => setSelectedApi(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
          >
            {apiOptions.map(api => (
              <option key={api.value} value={api.value}>{api.label}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={refetch}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test API Call
          </button>
        </div>
      </div>

      {/* URL Display */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Testing URL:
        </label>
        <div className="p-3 bg-gray-900 rounded border border-gray-600">
          <code className="text-green-400 text-sm break-all">
            {testUrl}
          </code>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Results:</h3>
          <div className="flex items-center space-x-4 text-sm">
            {loading && <span className="text-yellow-400">Loading...</span>}
            {error && <span className="text-red-400">❌ Error</span>}
            {!loading && !error && data && <span className="text-green-400">✅ Success</span>}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900 border border-red-700 rounded">
            <h4 className="text-red-400 font-medium mb-2">Error Details:</h4>
            <p className="text-red-300 text-sm">{error}</p>
            
            <div className="mt-3">
              <h5 className="text-red-400 text-sm font-medium mb-1">Possible Causes:</h5>
              <ul className="text-red-300 text-sm space-y-1">
                <li>• CORS policy blocking the request</li>
                <li>• API endpoint has changed</li>
                <li>• Network connectivity issue</li>
                <li>• Invalid country code or parameters</li>
                <li>• API rate limiting</li>
              </ul>
            </div>
          </div>
        )}

        {/* Success Display */}
        {!loading && !error && data && (
          <div className="p-4 bg-gray-900 border border-gray-600 rounded">
            <h4 className="text-green-400 font-medium mb-2">Response Data:</h4>
            <pre className="text-green-300 text-xs overflow-auto max-h-96 bg-black p-3 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        {/* No Data */}
        {!loading && !error && !data && (
          <div className="p-4 bg-gray-700 border border-gray-600 rounded">
            <p className="text-gray-300">Click "Test API Call" to check the API response</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugApiTester;