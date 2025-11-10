import React, { useState, useMemo } from 'react';
import { WorkPack } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { PlusIcon } from './icons/PlusIcon';

interface WorkPackListProps {
  workPacks: WorkPack[];
  onSelectWorkPack: (id: string) => void;
  onOpenAddModal: () => void;
}

const StatusBadge: React.FC<{ status: WorkPack['status'] }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block";
  const statusClasses = {
    'Pending Review': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const WorkPackList: React.FC<WorkPackListProps> = ({ workPacks, onSelectWorkPack, onOpenAddModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkPack['status'] | 'all'>('all');

  const filteredWorkPacks = useMemo(() => {
    return workPacks.filter(wp => {
      const matchesSearch = wp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            wp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            wp.aircraftType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || wp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workPacks, searchTerm, statusFilter]);

  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-100 overflow-y-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Pack Evaluation</h1>
            <p className="text-gray-600 mt-1">Select a work pack to view details and perform AI-assisted evaluation.</p>
        </div>
        <button 
            onClick={onOpenAddModal}
            className="mt-4 md:mt-0 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
            <PlusIcon className="w-5 h-5" />
            Add New Work Pack
        </button>
      </header>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by ID, title, or aircraft..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="font-semibold text-gray-700">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border-gray-300 rounded-lg shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="all">All</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Pack ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aircraft</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWorkPacks.map(wp => (
              <tr key={wp.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{wp.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{wp.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wp.aircraftType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={wp.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(wp.dateCreated).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => onSelectWorkPack(wp.id)} className="text-blue-600 hover:text-blue-900">
                    View & Evaluate
                  </button>
                </td>
              </tr>
            ))}
             {filteredWorkPacks.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                        No work packs found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkPackList;