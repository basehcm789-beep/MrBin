import React, { useState } from 'react';
import { Message, WorkLog, Flight, ManpowerTask } from '../types';
import { queryWorkLogData, queryFlightData, calculateManpower } from '../services/geminiService';
import { saveDataToGoogleSheet } from '../services/googleSheetService';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import DataTypeSelector from './DataTypeSelector';

declare global {
    interface Window {
        XLSX: any;
    }
}

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataType, setDataType] = useState<'worklog' | 'flight' | 'manpower' | null>(null);
  const [workLogData, setWorkLogData] = useState<WorkLog[] | null>(null);
  const [flightData, setFlightData] = useState<Flight[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
        let aiMessage: Message;
        if (dataType === 'worklog' && workLogData) {
            const response = await queryWorkLogData(text, workLogData);
            aiMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                text: response.summary,
                worklogs: response.worklogs,
            };
        } else if (dataType === 'flight' && flightData) {
            const response = await queryFlightData(text, flightData);
            aiMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                text: response.summary,
                flights: response.flights,
            };
        } else {
            aiMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                text: "I'm ready to help. Please upload an Excel file (.xlsx or .xls) using the paperclip icon to get started.",
            };
        }
        setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error processing request:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I'm sorry, I encountered an error. Please try again or rephrase your request.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExampleQuery = (query: string) => {
    handleSendMessage(query);
  };

  const handleFileUpload = (file: File) => {
      if (!window.XLSX || !dataType) {
          console.error("XLSX library not loaded or data type not selected");
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

            if (dataType === 'manpower') {
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

                setWorkLogData(null);
                setFlightData(null);

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

            } else if (dataType === 'worklog') {
                setWorkLogData(json as WorkLog[]);
                setFlightData(null);
                const saveStatus = await saveDataToGoogleSheet(json, file.name);
                let feedbackText = `Successfully loaded "${file.name}" with ${json.length} work log records.`;
                 if (saveStatus === 'success') {
                    feedbackText += " The data has also been saved to your Google Sheet.";
                } else if (saveStatus === 'error') {
                    feedbackText += " However, I couldn't save the data to your Google Sheet. You can still analyze it in this session.";
                }
                 setMessages([{ id: Date.now(), sender: 'ai', text: feedbackText }]);
            } else if (dataType === 'flight') {
                setFlightData(json as Flight[]);
                setWorkLogData(null);
                setMessages([{ id: Date.now(), sender: 'ai', text: `Successfully loaded "${file.name}" with ${json.length} flight records. You can now ask questions about this data.` }]);
            }

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
    setWorkLogData(null);
    setFlightData(null);
    setFileName(null);
    setDataType(null);
    setMessages([]);
  };

  const handleSelectDataType = (type: 'worklog' | 'flight' | 'manpower') => {
    setDataType(type);
    setMessages([]);
  }

  return (
    <div className="bg-gray-100 h-full flex flex-col antialiased">
      <main className="flex-1 flex flex-col overflow-hidden">
        {!dataType ? (
            <DataTypeSelector onSelect={handleSelectDataType} />
        ) : (
            <ChatWindow 
                messages={messages} 
                isLoading={isLoading} 
                onExampleQueryClick={handleExampleQuery} 
                isDataMode={!!(workLogData || flightData)}
                dataType={dataType}
            />
        )}
        <div className="bg-white/80 backdrop-blur-md border-t border-gray-200 sticky bottom-0 p-4">
             <MessageInput 
                onSendMessage={handleSendMessage} 
                onFileUpload={handleFileUpload} 
                isLoading={isLoading} 
                fileName={fileName}
                onClearData={handleClearData}
                dataType={dataType}
              />
        </div>
      </main>
    </div>
  );
};

export default ChatView;
