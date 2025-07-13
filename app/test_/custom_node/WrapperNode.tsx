import React, { ReactNode } from 'react';

interface WorkflowNodeWrapperProps {
    data: any;
    children: ReactNode;
}

export default function WorkflowNodeWrapper({ data, children }: WorkflowNodeWrapperProps) {
    const getStatusColor = () => {
        switch (data?.executionStatus) {
            case 'running': return 'border-yellow-400 shadow-yellow-400/20';
            case 'success': return 'border-green-400 shadow-green-400/20';
            case 'error': return 'border-red-400 shadow-red-400/20';
            default: return 'border-zinc-600/50 shadow-lg';
        }
    };

    return (
        <div className={`
            relative 
            bg-gradient-to-br from-zinc-900 to-zinc-800 
            rounded-xl 
            border-2 
            ${getStatusColor()}
            p-4 
            w-80 
            text-white 
            shadow-xl
            transition-all 
            duration-300 
            hover:shadow-2xl
            hover:brightness-110
        `}>
            {children}
        </div>
    );
}
