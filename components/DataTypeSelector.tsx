import React from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { FlightIcon } from './icons/FlightIcon';
import { WrenchIcon } from './icons/WrenchIcon';

interface DataTypeSelectorProps {
    onSelect: (type: 'worklog' | 'flight' | 'manpower') => void;
}

const DataTypeSelector: React.FC<DataTypeSelectorProps> = ({ onSelect }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Aviation AI</h2>
             <p className="max-w-xl mx-auto text-gray-600 mb-8">
                Please select the type of data you would like to analyze to get started.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
                <button 
                    onClick={() => onSelect('worklog')}
                    className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-500 transition-all duration-300 cursor-pointer text-center"
                >
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <ChartBarIcon className="w-8 h-8"/>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Phân tích Nhật ký Công việc</h3>
                    <p className="text-sm text-gray-500">
                        Tải lên và phân tích dữ liệu về giờ công, chuyến bay, và các hoạt động bảo trì.
                    </p>
                </button>
                <button 
                    onClick={() => onSelect('flight')}
                    className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-500 transition-all duration-300 cursor-pointer text-center"
                >
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <FlightIcon className="w-8 h-8"/>
                    </div>
                     <h3 className="text-lg font-semibold text-gray-800 mb-1">Phân tích Lịch bay</h3>
                    <p className="text-sm text-gray-500">
                         Tải lên và đặt câu hỏi về lịch bay, tìm kiếm chuyến bay, giá vé, và các thông tin liên quan.
                    </p>
                </button>
                <button 
                    onClick={() => onSelect('manpower')}
                    className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-purple-500 transition-all duration-300 cursor-pointer text-center"
                >
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                        <WrenchIcon className="w-8 h-8"/>
                    </div>
                     <h3 className="text-lg font-semibold text-gray-800 mb-1">Phân tích & Tính toán Nhân lực</h3>
                    <p className="text-sm text-gray-500">
                         Tải lên file excel công việc để tính toán số lượng nhân sự cần thiết dựa trên giờ công.
                    </p>
                </button>
            </div>
        </div>
    );
};

export default DataTypeSelector;
