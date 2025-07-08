// components/WorkflowNodeWrapper.tsx
import React, { ReactNode } from 'react';

type ExecutionStatus = 'pending' | 'running' | 'success' | 'error';

interface WorkflowNodeData {
    executionStatus?: ExecutionStatus;
    executionDuration?: number;
    [key: string]: any; // Pour les autres props spécifiques aux nodes
}

interface WorkflowNodeWrapperProps {
    data: WorkflowNodeData;
    children: ReactNode;
}

const WorkflowNodeWrapper: React.FC<WorkflowNodeWrapperProps> = ({ data, children }) => {
    const status: ExecutionStatus = data.executionStatus || 'pending';
    const duration = data.executionDuration;
    
    // Couleurs selon le statut
    const borderColorMap: Record<ExecutionStatus, string> = {
        pending: 'border-gray-400',
        running: 'border-yellow-400',
        success: 'border-green-400', 
        error: 'border-red-400'
    };
    
    const borderColor = borderColorMap[status];
    
    // Icones selon le statut
    const iconMap: Record<ExecutionStatus, string | null> = {
        pending: null,
        running: '⏳',
        success: '✅',
        error: '❌'
    };
    
    const icon = iconMap[status];
    
    return (
        <div className={`relative bg-gray-800 rounded-lg border-2 ${borderColor} p-4`}>
            {/* Icone de statut */}
            {icon && (
                <div className="absolute -top-2 -right-2 text-lg">
                    {icon}
                </div>
            )}
            
            {/* Contenu du node */}
            {children}
            
            {/* Durée */}
            {duration !== undefined && (
                <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                    {duration}ms
                </div>
            )}
        </div>
    );
};

export default WorkflowNodeWrapper;
