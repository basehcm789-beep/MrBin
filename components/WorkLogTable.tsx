import React from 'react';
import { WorkLog } from '../types';

interface WorkLogTableProps {
  worklogs: WorkLog[];
}

const WorkLogTable: React.FC<WorkLogTableProps> = ({ worklogs }) => {
    
    // FIX: Updated function signature to accept `string | number` and implemented logic to handle both types.
    const formatDate = (dateString: string | number) => {
        // Handle potential non-standard date formats from Excel.
        // The value from the sheet can be a string or an Excel serial number.
        if (typeof dateString === 'number') {
            if (dateString > 0) {
                 // Convert Excel serial number to JS Date
                 const excelEpoch = new Date(1899, 11, 30);
                 const correctDate = new Date(excelEpoch.getTime() + dateString * 24 * 60 * 60 * 1000);
                 if (!isNaN(correctDate.getTime())) return correctDate.toLocaleDateString();
            }
            return String(dateString); // If not a valid Excel date number, return as string.
        }

        // Handle date as a string
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString; // return original if parsing fails
        }
        return date.toLocaleDateString();
    };


  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Date</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Aircraft Type</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Airport</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Work Type</th>
            <th className="px-4 py-2 text-right font-semibold text-gray-600">Flights</th>
            <th className="px-4 py-2 text-right font-semibold text-gray-600">ManHours</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">FileName</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {worklogs.map((log, index) => (
            <tr key={index}>
              <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(log.Date)}</td>
              <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{log.AircraftType}</td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-500">{log.Airport}</td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-500">{log.WorkType}</td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-gray-800">{log.Flights}</td>
              <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-800">{log.ManHours}</td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-500 truncate max-w-xs">{log.FileName || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkLogTable;
