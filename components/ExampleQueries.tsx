import React from 'react';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

const ExampleQueries: React.FC = () => {
    
    const welcomeText = "Để bắt đầu, hãy tải lên một tệp Excel chứa các nhiệm vụ công việc để tính toán nhân lực.";

    return (
        <div className="text-center p-8 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <PaperAirplaneIcon className="w-8 h-8 text-gray-500 transform -rotate-45" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">AI Manpower Calculator</h2>
            <p className="max-w-md mx-auto text-gray-600">
                {welcomeText} Use the paperclip icon below to upload.
            </p>
        </div>
    );

};

export default ExampleQueries;