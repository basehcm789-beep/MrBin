import React from 'react';

interface AggregatedDataTableProps {
  title: string;
  description: string;
  headers: { key: string; label: string; isNumeric?: boolean }[];
  data: { [key: string]: string | number }[];
}

export const AggregatedDataTable: React.FC<AggregatedDataTableProps> = ({ title, description, headers, data }) => {
    
    if (data.length === 0) {
        return <div className="text-center text-gray-500 p-8">No aggregated data to display.</div>;
    }

  return (
    <div className="w-full overflow-x-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <div className="rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
            <tr>
                {headers.map(header => (
                     <th key={header.key} className={`px-4 py-2 font-semibold text-gray-600 ${header.isNumeric ? 'text-right' : 'text-left'}`}>
                        {header.label}
                    </th>
                ))}
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
                <tr key={index}>
                    {headers.map(header => (
                         <td key={header.key} className={`px-4 py-3 whitespace-nowrap ${header.isNumeric ? 'text-right text-gray-600' : `font-medium text-gray-800 ${header.key === 'label' ? 'truncate max-w-xs' : ''}`}`}>
                            {typeof row[header.key] === 'number' ? (row[header.key] as number).toLocaleString() : row[header.key]}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
