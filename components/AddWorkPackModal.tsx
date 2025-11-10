import React, { useState } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface AddWorkPackModalProps {
    onClose: () => void;
    onSave: (data: { title: string; description: string; aircraftType: string; tasks: string[] }) => void;
}

const AddWorkPackModal: React.FC<AddWorkPackModalProps> = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [aircraftType, setAircraftType] = useState('');
    const [description, setDescription] = useState('');
    const [tasks, setTasks] = useState<string[]>([]);
    const [currentTask, setCurrentTask] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAddTask = () => {
        if (currentTask.trim()) {
            setTasks([...tasks, currentTask.trim()]);
            setCurrentTask('');
        }
    };

    const handleRemoveTask = (indexToRemove: number) => {
        setTasks(tasks.filter((_, index) => index !== indexToRemove));
    };

    const handleSave = () => {
        if (!title.trim()) {
            setError('Title is required.');
            return;
        }
        if (tasks.length === 0) {
            setError('At least one task is required.');
            return;
        }
        setError(null);
        onSave({ title, description, aircraftType, tasks });
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Add New Work Pack</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <main className="p-6 space-y-4 overflow-y-auto">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                            <p>{error}</p>
                        </div>
                    )}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                    </div>
                     <div>
                        <label htmlFor="aircraftType" className="block text-sm font-medium text-gray-700 mb-1">Aircraft Type</label>
                        <input type="text" id="aircraftType" value={aircraftType} onChange={e => setAircraftType(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                    </div>
                    
                    <div className="pt-2">
                         <label htmlFor="task-input" className="block text-sm font-medium text-gray-700 mb-1">Tasks <span className="text-red-500">*</span></label>
                         <div className="flex gap-2">
                             <input 
                                type="text" 
                                id="task-input"
                                placeholder="Enter a task description..."
                                value={currentTask}
                                onChange={e => setCurrentTask(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleAddTask()}
                                className="flex-grow border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <button onClick={handleAddTask} className="bg-gray-200 text-gray-700 font-semibold px-4 rounded-lg hover:bg-gray-300 flex items-center gap-2">
                                <PlusIcon className="w-5 h-5" /> Add
                            </button>
                         </div>
                         <ul className="mt-4 space-y-2">
                            {tasks.map((task, index) => (
                                <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200">
                                    <span className="text-gray-800">{task}</span>
                                    <button onClick={() => handleRemoveTask(index)} className="p-1 text-gray-400 hover:text-red-500">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </li>
                            ))}
                            {tasks.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No tasks added yet.</p>}
                         </ul>
                    </div>
                </main>

                <footer className="flex items-center justify-end p-4 border-t border-gray-200 bg-gray-50">
                    <button onClick={onClose} className="bg-white text-gray-700 font-bold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 mr-2">
                        Cancel
                    </button>
                     <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Save Work Pack
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AddWorkPackModal;