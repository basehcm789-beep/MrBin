import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface ExampleQueriesProps {
    onQueryClick: (query: string) => void;
    isDataMode: boolean;
    dataType: 'worklog' | 'flight' | 'manpower' | null;
}

const workLogQueries = [
    "What is the total ManHours for all tasks?",
    "Which airport has the most activity? List the top 3.",
    "Show me all the work logs for AircraftType 'B787 VNA'.",
    "Calculate the average number of flights per day.",
];

const flightQueries = [
    "Find all flights from SGN to HAN.",
    "What is the cheapest flight available?",
    "Show me all flights operated by Vietnam Airlines.",
    "Are there any flights arriving after 10 PM?",
];


const ExampleQueries: React.FC<ExampleQueriesProps> = ({ onQueryClick, isDataMode, dataType }) => {
    
    if (isDataMode && dataType && dataType !== 'manpower') {
        const queries = dataType === 'worklog' ? workLogQueries : flightQueries;
        const title = dataType === 'worklog' ? 'Ask about your work logs' : 'Ask about your flight data';
        return (
            <div className="text-center p-4">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <SparklesIcon className="w-6 h-6 text-yellow-500"/>
                    <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {queries.map((query, index) => (
                        <button
                            key={index}
                            onClick={() => onQueryClick(query)}
                            className="bg-white p-4 rounded-lg text-left text-gray-600 hover:bg-gray-50 hover:shadow-md transition-all border border-gray-200"
                        >
                            {query}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const welcomeText = !dataType
      ? "Please select a data type to begin."
      : dataType === 'worklog' 
        ? "To get started, upload an Excel file with your aviation work logs."
        : dataType === 'flight'
        ? "To get started, upload an Excel file with your flight schedule."
        : "Để bắt đầu, hãy tải lên một tệp Excel chứa các nhiệm vụ công việc để tính toán nhân lực.";


    return (
        <div className="text-center p-8 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <PaperAirplaneIcon className="w-8 h-8 text-gray-500 transform -rotate-45" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">AI Aviation Assistant</h2>
            <p className="max-w-md mx-auto text-gray-600">
                {welcomeText} {dataType && 'Use the paperclip icon below to upload.'}
            </p>
        </div>
    );

};

export default ExampleQueries;
