import React from 'react';

interface KPICardProps {
    title: string;
    value: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
};

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, color }) => {
    const classes = colorClasses[color];

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${classes.bg}`}>
                <Icon className={`w-6 h-6 ${classes.text}`} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};
