import React from 'react';
import { Message } from '../types';
import { UserIcon } from './icons/UserIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import ManpowerTable from './ManpowerTable';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white'
    : message.isError ? 'bg-red-100 text-red-800' : 'bg-white text-gray-800 shadow-sm';
  const icon = isUser ? 
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-3"><UserIcon className="w-5 h-5 text-blue-600" /></div>
    : <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3"><PaperAirplaneIcon className="w-5 h-5 text-gray-600 transform -rotate-45" /></div>;

  return (
    <div className={`${containerClasses} items-start`}>
      {!isUser && icon}
      <div className={`rounded-lg p-4 max-w-lg lg:max-w-4xl ${bubbleClasses}`}>
        <p className="whitespace-pre-wrap">{message.text}</p>
        {message.zoneManpower && message.zoneManpower.length > 0 && (
            <div className="mt-4">
                <ManpowerTable data={message.zoneManpower} />
            </div>
        )}
      </div>
       {isUser && icon}
    </div>
  );
};

export default ChatMessage;