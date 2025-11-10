import React from 'react';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';

const Navigation: React.FC = () => {
    
    const navItems = [
        { id: 'manpower', label: 'Manpower Calculator', icon: ChatBubbleIcon },
    ];

    return (
        <nav className="bg-white border-r border-gray-200 w-64 p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-8 px-2">
                 <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <PaperAirplaneIcon className="w-6 h-6 text-white transform -rotate-45" />
                 </div>
                 <h1 className="text-xl font-bold text-gray-800">Aviation AI Tools</h1>
            </div>
            <ul className="space-y-2">
                {navItems.map(item => (
                    <li key={item.id}>
                        <button 
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-semibold transition-colors bg-blue-50 text-blue-700`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="mt-auto text-center text-xs text-gray-400">
                <p>Manpower Analysis & Planning</p>
                <p>By NDKBVH</p>
            </div>
        </nav>
    );
};

export default Navigation;