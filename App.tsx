import React from 'react';
import Navigation from './components/Navigation';
import ChatView from './components/ChatView';

const App: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen w-screen flex antialiased">
      <Navigation />
      <div className="flex-1 flex flex-col h-screen">
        <ChatView />
      </div>
    </div>
  );
};

export default App;
