// Utility functions for workflow operations
export const formatDuration = (durationMs: number): string => {
    return durationMs < 1000 ? `${durationMs}ms` : `${(durationMs / 1000).toFixed(2)}s`;
};

export const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString();
};

export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'success': return 'text-green-400';
        case 'error': return 'text-red-400';
        case 'running': return 'text-yellow-400';
        default: return 'text-zinc-400';
    }
};

export const getBorderColor = (status: string): string => {
    switch (status) {
        case 'running': return 'border-yellow-400 shadow-yellow-400/20';
        case 'success': return 'border-green-400 shadow-green-400/20';
        case 'error': return 'border-red-400 shadow-red-400/20';
        default: return 'border-zinc-600/50';
    }
};