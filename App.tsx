import React, { useState } from 'react';
import Navigation from './components/Navigation';
import ChatView from './components/ChatView';
import Dashboard from './components/Dashboard';
import WorkPackView from './components/WorkPackView';

export type View = 'manpower' | 'dashboard' | 'workpack';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('manpower');

  const renderContent = () => {
    switch (activeView) {
      case 'manpower':
        return <ChatView />;
      case 'dashboard':
        return <Dashboard />;
      case 'workpack':
        return <WorkPackView />;
      default:
        return <ChatView />;
    }
  };


  return (
    <div className="bg-gray-50 min-h-screen w-screen flex antialiased">
      <Navigation activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col h-screen">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
