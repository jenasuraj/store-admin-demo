import React from 'react';
import { Download, FileSpreadsheet, Search, Bell, Menu } from 'lucide-react';

const PennantHomePage = () => {
  // Mock function to handle file download from the public folder
  const handleExport = () => {
    // This assumes you have a file named 'data.csv' in your project's /public folder
    const fileUrl = '/autobot/Pennant_LMS.xlsx'; 
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', 'pennant_data.csv'); // Force download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Top Navigation Bar --- */}
      <header className="sticky top-0 z-30 w-full border-b bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo / Branding */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white">
              <span className="font-bold">P</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Pennant Dashboard</span>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700">
              <Search className="h-5 w-5" />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <Bell className="h-5 w-5" />
            </button>
            
            {/* The Requested Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
            
             <button className="sm:hidden text-gray-500">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Transactions</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and view all recent transaction data.
            </p>
          </div>
          {/* Optional: Filter Placeholder */}
          <div className="hidden h-10 w-32 animate-pulse rounded bg-gray-200 sm:block"></div>
        </div>

        {/* --- Large Table Skeleton --- */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Header Skeleton */}
              <thead className="bg-gray-50">
                <tr>
                  {[1, 2, 3, 4, 5, 6].map((col) => (
                    <th key={col} className="px-6 py-3 text-left">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              {/* Table Body Skeleton */}
              <tbody className="divide-y divide-gray-200 bg-white">
                {/* Generating 12 rows to simulate a "Large" table */}
                {Array.from({ length: 12 }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {/* Column 1: Small icon + text */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                      </div>
                    </td>
                    
                    {/* Column 2: Date */}
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                    </td>

                    {/* Column 3: Status Badge */}
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200"></div>
                    </td>

                    {/* Column 4: Amount */}
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                    </td>

                    {/* Column 5: Description (Longer) */}
                    <td className="px-6 py-4">
                      <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                    </td>
                    
                     {/* Column 6: Actions */}
                    <td className="px-6 py-4 text-right">
                       <div className="ml-auto h-4 w-4 animate-pulse rounded bg-gray-300"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
           <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
              </div>
              <div className="flex gap-2">
                 <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                 <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                 <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default PennantHomePage;