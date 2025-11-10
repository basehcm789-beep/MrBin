import React, { useMemo } from 'react';
import { WorkLog } from '../types';

interface FileListTableProps {
  data: WorkLog[];
}

export const FileListTable: React.FC<FileListTableProps> = ({ data }) => {
    
    const aggregatedData = useMemo(() => {
        if (!data) return [];
        const fileMap = new Map<string, { Flights: number; ManHours: number; recordCount: number }>();
        
        data.forEach(item => {
            const fileName = item.FileName || 'Unknown File';
            if (!fileMap.has(fileName)) {
                fileMap.set(fileName, { Flights: 0, ManHours: 0, recordCount: 0 });
            }
            const current = fileMap.get(fileName)!;
            current.Flights += item.Flights;
            current.ManHours += item.ManHours;
            current.recordCount += 1;
        });

        return Array.from(fileMap.entries()).map(([fileName, values]) => ({
            fileName,
            ...values,
        }));
    }, [data]);

    if (aggregatedData.length === 0) {
        return <div className="text-center text-gray-500 p-8">No files found in the selected date range.</div>;
    }

  return (
    <div className="w-full overflow-x-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Danh Sách File</h3>
      <p className="text-sm text-gray-500 mb-4">Tổng hợp dữ liệu theo từng file nguồn trong khoảng thời gian đã chọn.</p>
      <div className="rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
            <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Tên File</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">Tổng Chuyến Bay</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">Tổng Giờ Công</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">Số Dòng Dữ Liệu</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {aggregatedData.map((file, index) => (
                <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{file.fileName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">{file.Flights.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">{file.ManHours.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">{file.recordCount.toLocaleString()}</td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};