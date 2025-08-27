// src/components/Upload/UploadData.js
import React from 'react';
import { Upload, FileText, RefreshCw } from 'lucide-react';

const UploadData = ({ uploadedFiles, isLoading, uploadFile, fetchUploadedFiles }) => {
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      try {
        await uploadFile(file);
      } catch (error) {
        alert(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Upload className="mr-3" />
        Upload Data
      </h2>
      
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <Upload size={48} className="mx-auto text-blue-400 mb-4" />
          <p className="text-white text-lg mb-2">Upload your data files</p>
          <p className="text-gray-400 mb-4">
            Supported formats: CSV, Excel, JSON
          </p>
          <input
            type="file"
            multiple
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isLoading}
          />
          <label
            htmlFor="file-upload"
            className={`px-6 py-2 rounded-lg cursor-pointer inline-block transition-colors ${
              isLoading 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? 'Uploading...' : 'Choose Files'}
          </label>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
              Uploaded Files
              <button 
                onClick={fetchUploadedFiles}
                className="text-blue-400 hover:text-blue-300"
                disabled={isLoading}
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-600 p-3 rounded">
                  <div className="flex items-center">
                    <FileText className="text-blue-400 mr-3" size={20} />
                    <span className="text-white">{file.filename}</span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
            <button 
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Process Data'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadData;