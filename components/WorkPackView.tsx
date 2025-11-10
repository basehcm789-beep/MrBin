import React, { useState } from 'react';
import { WorkPack } from '../types';
import { mockWorkPacks } from '../data/workPacks';
import WorkPackList from './WorkPackList';
import WorkPackDetailView from './WorkPackDetailView';
import AddWorkPackModal from './AddWorkPackModal';

const WorkPackView: React.FC = () => {
    const [workPacks, setWorkPacks] = useState<WorkPack[]>(mockWorkPacks);
    const [selectedWorkPackId, setSelectedWorkPackId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleSelectWorkPack = (id: string) => {
        setSelectedWorkPackId(id);
    };

    const handleBackToList = () => {
        setSelectedWorkPackId(null);
    };

    const handleUpdateStatus = (id: string, status: 'Approved' | 'Rejected') => {
        setWorkPacks(prevPacks => 
            prevPacks.map(wp => 
                wp.id === id ? { ...wp, status } : wp
            )
        );
        setSelectedWorkPackId(null); // Go back to list after action
    };

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };
    
    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    };

    const handleSaveWorkPack = (data: { title: string; description: string; aircraftType: string; tasks: string[] }) => {
        const newWorkPack: WorkPack = {
            id: `WP-${new Date().getFullYear()}-${String(workPacks.length + 1).padStart(3, '0')}`,
            title: data.title,
            description: data.description,
            aircraftType: data.aircraftType,
            createdBy: 'Current User', // Placeholder
            dateCreated: new Date().toISOString(),
            status: 'Pending Review',
            tasks: data.tasks.map((desc, index) => ({
                id: `t-${String(index + 1).padStart(3, '0')}`,
                description: desc,
                isCompleted: false,
            })),
        };
        setWorkPacks(prev => [newWorkPack, ...prev]);
        setIsAddModalOpen(false);
    };

    const selectedWorkPack = workPacks.find(wp => wp.id === selectedWorkPackId);

    return (
        <div className="bg-gray-100 h-full flex flex-col">
            {isAddModalOpen && <AddWorkPackModal onClose={handleCloseAddModal} onSave={handleSaveWorkPack} />}
            
            {selectedWorkPack ? (
                <WorkPackDetailView 
                    workPack={selectedWorkPack} 
                    onBack={handleBackToList}
                    onUpdateStatus={handleUpdateStatus}
                />
            ) : (
                <WorkPackList 
                    workPacks={workPacks} 
                    onSelectWorkPack={handleSelectWorkPack}
                    onOpenAddModal={handleOpenAddModal}
                />
            )}
        </div>
    );
};

export default WorkPackView;
