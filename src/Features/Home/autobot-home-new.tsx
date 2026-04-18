import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/lib/constants';

const AutobotNewHomePage = () => {
  const [files, setFiles] = useState<{
    bank: File | null;
    oracle: File | null;
    pennant: File | null;
  }>({ bank: null, oracle: null, pennant: null });

  const [message, setMessage] = useState('');

  const handleFileChange = (key: 'bank' | 'oracle' | 'pennant', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    if (files.bank) formData.append("bankFile", files.bank);
    if (files.oracle) formData.append("oracleFile", files.oracle);
    if (files.pennant) formData.append("pennantFile", files.pennant);

    try {
      setMessage("Uploading...");
      const response = await axios.post(`${BASE_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage("Upload Successful!");
    } catch (error) {
      setMessage("Upload Failed.");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-6">RPA Data Ingestion</h1>
      
      <div className="space-y-6">
        {/* RPA Friendly Input 1 */}
        <div className="border p-4 bg-gray-50">
          <label htmlFor="bank-upload" className="block font-bold mb-2">1. Upload Bank Data</label>
          {/* Notice this input is NOT hidden. It is standard and visible. */}
          <input 
            type="file" 
            id="bank-upload" 
            onChange={(e) => handleFileChange('bank', e)}
            className="block w-full text-sm text-gray-500 border border-gray-300 p-2 cursor-pointer"
          />
        </div>

        {/* RPA Friendly Input 2 */}
        <div className="border p-4 bg-gray-50">
          <label htmlFor="oracle-upload" className="block font-bold mb-2">2. Upload Oracle GL Data</label>
          <input 
            type="file" 
            id="oracle-upload" 
            onChange={(e) => handleFileChange('oracle', e)}
            className="block w-full text-sm text-gray-500 border border-gray-300 p-2 cursor-pointer"
          />
        </div>

        {/* RPA Friendly Input 3 */}
        <div className="border p-4 bg-gray-50">
          <label htmlFor="pennant-upload" className="block font-bold mb-2">3. Upload Pennant Data</label>
          <input 
            type="file" 
            id="pennant-upload" 
            onChange={(e) => handleFileChange('pennant', e)}
            className="block w-full text-sm text-gray-500 border border-gray-300 p-2 cursor-pointer"
          />
        </div>
      </div>

      <button 
        id="submit-upload-btn"
        onClick={handleUpload}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700"
      >
        Submit Files
      </button>

      {message && <p id="status-message" className="mt-4 font-bold text-lg">{message}</p>}
    </div>
  );
};

export default AutobotNewHomePage;