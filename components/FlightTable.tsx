
import React from 'react';
import { Flight } from '../types';
import { PlaneIcon } from './icons/PlaneIcon';

interface FlightTableProps {
  flights: Flight[];
}

const FlightTable: React.FC<FlightTableProps> = ({ flights }) => {
    
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
    };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Airline</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Flight</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Departure</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Arrival</th>
            <th className="px-4 py-2 text-center font-semibold text-gray-600">Duration</th>
            <th className="px-4 py-2 text-right font-semibold text-gray-600">Price</th>
            <th className="px-4 py-2 text-center font-semibold text-gray-600"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {flights.map((flight, index) => (
            <tr key={index}>
              <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{flight.airline}</td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-500">{flight.flightNumber}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="font-semibold text-gray-800">{flight.origin}</div>
                <div className="text-gray-500">{formatTime(flight.departureTime)}</div>
                <div className="text-xs text-gray-400">{formatDate(flight.departureTime)}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="font-semibold text-gray-800">{flight.destination}</div>
                <div className="text-gray-500">{formatTime(flight.arrivalTime)}</div>
                 <div className="text-xs text-gray-400">{formatDate(flight.arrivalTime)}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                 <div className="text-gray-800">{flight.duration}</div>
                 <div className="text-xs text-gray-500">{flight.stops} stop{flight.stops !== 1 ? 's' : ''}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-lg text-green-600">${flight.price.toLocaleString()}</td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                <button className="bg-blue-600 text-white text-xs font-bold py-2 px-3 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                  Book Now
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FlightTable;
