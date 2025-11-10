import React from 'react';

export const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        {...props}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-1.542a5.986 5.986 0 0 0 0-8.414A5.986 5.986 0 0 0 12 2.25c-1.63 0-3.14.65-4.242 1.757a5.986 5.986 0 0 0 0 8.414a6.01 6.01 0 0 0 1.5 1.542M12 18h0" />
    </svg>
);
