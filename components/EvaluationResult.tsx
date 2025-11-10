import React from 'react';
import { WorkPackEvaluationResponse } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { WrenchIcon } from './icons/WrenchIcon';

interface EvaluationResultProps {
  evaluation: WorkPackEvaluationResponse;
}

const InfoSection: React.FC<{ title: string; items: string[]; icon: React.FC<any>; color: string }> = ({ title, items, icon: Icon, color }) => {
  const colorClasses = {
      green: 'text-green-600 bg-green-50 border-green-200',
      yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      red: 'text-red-600 bg-red-50 border-red-200'
  };

  const hasItems = items && items.length > 0;

  return (
    <div>
      <h4 className={`text-sm font-bold flex items-center gap-2 mb-2 ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
        {title} {hasItems && `(${items.length})`}
      </h4>
      {hasItems ? (
        <ul className="space-y-1.5 pl-2">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start">
              <span className={`mr-2 mt-1 w-1 h-1 rounded-full ${colorClasses[color].split(' ')[1]}`}></span>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 pl-7 italic">None identified.</p>
      )}
    </div>
  );
};


const EvaluationResult: React.FC<EvaluationResultProps> = ({ evaluation }) => {
    const scoreColor = evaluation.overallScore >= 8 ? 'text-green-600' : evaluation.overallScore >= 5 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="mt-6 space-y-6">
        <div className="text-center">
            <p className="text-sm font-semibold text-gray-500">Overall Score</p>
            <p className={`text-6xl font-bold ${scoreColor}`}>{evaluation.overallScore}<span className="text-3xl text-gray-400">/10</span></p>
            <p className="text-sm text-gray-600 mt-1">{evaluation.summary}</p>
        </div>
        
        <div className="space-y-5 border-t border-gray-200 pt-5">
             <InfoSection title="Positive Points" items={evaluation.positivePoints} icon={CheckIcon} color="green" />
             <InfoSection title="Areas for Improvement" items={evaluation.areasForImprovement} icon={LightbulbIcon} color="yellow" />
             <InfoSection title="Suggested Modifications" items={evaluation.suggestedModifications} icon={WrenchIcon} color="blue" />
             <InfoSection title="Safety Concerns" items={evaluation.safetyConcerns} icon={ExclamationTriangleIcon} color="red" />
        </div>
    </div>
  );
};

export default EvaluationResult;