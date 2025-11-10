import React from 'react';
import { ZoneManpower } from '../types';
import { UsersIcon } from './icons/UsersIcon';

interface ManpowerTableProps {
  data: ZoneManpower[];
}

const ManpowerTable: React.FC<ManpowerTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mt-4 border-t border-gray-200 pt-4">
            Chi tiết Nhân lực theo Zone
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((zoneData, index) => (
            <div key={index} className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 mb-3">
                <UsersIcon className="w-5 h-5 text-gray-500" />
                <h4 className="font-bold text-gray-700">
                Zone: <span className="text-blue-600">{zoneData.zone}</span>
                </h4>
            </div>
            <table className="min-w-full text-sm">
                <thead className="border-b border-gray-300">
                <tr>
                    <th className="py-1 text-left font-semibold text-gray-600">Loại nhân sự</th>
                    <th className="py-1 text-right font-semibold text-gray-600">Số lượng</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {zoneData.manpower
                    .filter(p => p.count > 0)
                    .map((personnel, pIndex) => (
                    <tr key={pIndex}>
                        <td className="py-1.5 whitespace-nowrap font-medium text-gray-800">{personnel.personnelType}</td>
                        <td className="py-1.5 whitespace-nowrap text-right text-gray-600 font-semibold">{personnel.count}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        ))}
        </div>
    </div>
  );
};

export default ManpowerTable;
