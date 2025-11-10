import React, { useState } from 'react';
import { WorkPack, WorkPackEvaluationResponse } from '../types';
import { evaluateWorkPack } from '../services/geminiService';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import EvaluationResult from './EvaluationResult';

interface WorkPackDetailViewProps {
    workPack: WorkPack;
    onBack: () => void;
    onUpdateStatus: (id: string, status: 'Approved' | 'Rejected') => void;
}

const WorkPackDetailView: React.FC<WorkPackDetailViewProps> = ({ workPack, onBack, onUpdateStatus }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [evaluation, setEvaluation] = useState<WorkPackEvaluationResponse | null>(null);

    const handleEvaluate = async () => {
        setIsLoading(true);
        setEvaluation(null);
        const result = await evaluateWorkPack(workPack);
        setEvaluation(result);
        setIsLoading(false);
    };

    const isActionable = workPack.status === 'Pending Review';

    return (
        <div className="flex-1 p-6 md:p-8 bg-gray-100 overflow-y-auto">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <button onClick={onBack} className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to List
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{workPack.title}</h1>
                    <p className="text-gray-600 mt-1">
                        Work Pack ID: <span className="font-mono">{workPack.id}</span> | Aircraft: <span className="font-semibold">{workPack.aircraftType}</span>
                    </p>
                </div>
                {isActionable && evaluation && (
                     <div className="flex items-center gap-3">
                        <button 
                            onClick={() => onUpdateStatus(workPack.id, 'Rejected')}
                            className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <XCircleIcon className="w-5 h-5" />
                            Reject
                        </button>
                        <button 
                            onClick={() => onUpdateStatus(workPack.id, 'Approved')}
                            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <CheckCircleIcon className="w-5 h-5" />
                            Approve
                        </button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Work Pack Details & Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{workPack.description}</p>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tasks ({workPack.tasks.length})</h2>
                        <ul className="space-y-3">
                            {workPack.tasks.map(task => (
                                <li key={task.id} className="flex items-start p-3 bg-gray-50 rounded-md border border-gray-200">
                                    <div className="flex-shrink-0 w-6 h-6 bg-gray-200 text-gray-600 text-xs font-bold rounded-full flex items-center justify-center mr-3">
                                        {task.id.split('-')[1]}
                                    </div>
                                    <span className="text-gray-800">{task.description}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column: AI Evaluation */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Evaluation</h2>
                        {workPack.status !== 'Pending Review' && (
                            <div className={`p-4 rounded-lg text-center font-semibold ${workPack.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                This work pack has been {workPack.status}.
                            </div>
                        )}
                        {isActionable && (
                            <>
                                <button
                                    onClick={handleEvaluate}
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center"
                                >
                                    {isLoading ? 'Evaluating...' : 'Evaluate with AI'}
                                     {!isLoading && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>}
                                </button>
                                {isLoading && <p className="text-center text-gray-500 mt-4 animate-pulse">AI is reviewing the document...</p>}
                                {evaluation && <EvaluationResult evaluation={evaluation} />}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkPackDetailView;
