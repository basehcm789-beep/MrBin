import React, { useState } from 'react';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  fileName: string | null;
  onClearData: () => void;
  dataType: 'worklog' | 'flight' | 'manpower' | null;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onFileUpload, isLoading, fileName, onClearData, dataType }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset file input to allow uploading the same file again
    e.target.value = '';
  };

  const placeholderText = fileName
    ? dataType === 'manpower'
        ? `Đã phân tích file "${fileName}". Tải file khác để bắt đầu lại.`
        : `Ask about "${fileName}"...`
    : dataType === 'worklog'
    ? "Upload work log data to start asking questions..."
    : dataType === 'flight'
    ? "Upload flight schedule data to start asking questions..."
    : "Tải file excel công việc để bắt đầu tính toán...";


  const analysisTypeLabel = dataType === 'flight' ? 'flight schedule' 
    : dataType === 'worklog' ? 'work logs' 
    : 'manpower data';

  return (
    <div className="max-w-4xl mx-auto">
      {fileName && (
        <div className="mb-2 flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg px-3 py-2">
          <p className="truncate overflow-hidden mr-2">
            Analyzing {analysisTypeLabel}: <span className="font-semibold">{fileName}</span>
          </p>
          <button
            onClick={onClearData}
            className="font-bold text-xl leading-none hover:text-blue-900 disabled:opacity-50 flex-shrink-0"
            aria-label="Clear data and change type"
            disabled={isLoading}
          >
            &times;
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <label
          htmlFor="file-upload"
          className={`p-3 border border-gray-300 rounded-lg transition-colors ${dataType ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed bg-gray-100'}`}
          aria-label="Attach file"
        >
          <PaperclipIcon className={`w-6 h-6 ${dataType ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              disabled={isLoading || !dataType}
          />
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholderText}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
          disabled={isLoading || !fileName || dataType === 'manpower'}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center"
          disabled={isLoading || !text.trim() || !fileName || dataType === 'manpower'}
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="w-6 h-6 transform" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
