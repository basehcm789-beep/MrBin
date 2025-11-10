import React, { useState } from 'react';
import { Message, ManpowerTask } from '../types';
import { calculateManpower } from '../services/geminiService';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';

declare global {
    interface Window {
        XLSX: any;
    }
}

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
      if (!window.XLSX) {
          console.error("XLSX library not loaded");
          setMessages([{ id: Date.now(), sender: 'ai', text: "Error: The XLSX library could not be loaded. Please check your internet connection and refresh.", isError: true }]);
          return;
      }
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
          try {
            const data = e.target?.result;
            const workbook = window.XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = window.XLSX.utils.sheet_to_json(worksheet);
            
            setFileName(file.name);
            setMessages([]); // Clear previous chat history

            const originalTasks = json as ManpowerTask[];
            
            // Process tasks: if 'MAC hour' is missing or falsy, set it to 0.009
            const processedTasks = originalTasks.map(task => {
                if (!task['MAC hour']) {
                    return {
                        ...task,
                        'MAC hour': 0.009
                    };
                }
                return task;
            });

            const response = await calculateManpower(processedTasks, file.name);

            // Aggregate total manpower from all zones for the summary
            const totalManpower = new Map<string, number>();
            if (response.zoneManpower) {
                response.zoneManpower.forEach(zone => {
                    zone.manpower.forEach(person => {
                        const currentCount = totalManpower.get(person.personnelType) || 0;
                        totalManpower.set(person.personnelType, currentCount + person.count);
                    });
                });
            }
            const manpowerString = Array.from(totalManpower.entries())
                .filter(([_, count]) => count > 0)
                .map(([type, count]) => `${count}${type}`)
                .join(', ');
            
            const fullText = `${response.summary}\n\nNhân lực : ${manpowerString}`;
            
            setMessages([{ 
                id: Date.now(), 
                sender: 'ai', 
                text: fullText,
                zoneManpower: response.zoneManpower
            }]);

          } catch (error) {
              console.error("Error processing Excel file:", error);
               setMessages([{ id: Date.now(), sender: 'ai', text: `I'm sorry, I had trouble reading "${file.name}". Please ensure it's a valid Excel file and the columns match the expected format.`, isError: true }]);
          } finally {
            setIsLoading(false);
          }
      };
      reader.readAsBinaryString(file);
  }

  const handleClearData = () => {
    setFileName(null);
    setMessages([]);
  };

  return (
    <div className="bg-gray-100 h-full flex flex-col antialiased">
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow 
            messages={messages} 
            isLoading={isLoading} 
        />
        <div className="bg-white/80 backdrop-blur-md border-t border-gray-200 sticky bottom-0 p-4">
             <MessageInput 
                onFileUpload={handleFileUpload} 
                isLoading={isLoading} 
                fileName={fileName}
                onClearData={handleClearData}
              />
        </div>
      </main>
    </div>
  );
};

export default ChatView;