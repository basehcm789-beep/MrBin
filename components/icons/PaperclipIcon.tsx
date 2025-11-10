import React from 'react';

export const PaperclipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        {...props}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3.375 3.375 0 0 1 19.5 7.372l-10.94 10.94a2.25 2.25 0 0 1-3.182-3.182l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a.75.75 0 0 0 1.06 1.06l10.94-10.94a1.875 1.875 0 0 0-2.652-2.652L6.836 12.739a3 3 0 0 0 4.243 4.243l7.693-7.693a.75.75 0 0 1 1.06-1.06Z" />
    </svg>
);