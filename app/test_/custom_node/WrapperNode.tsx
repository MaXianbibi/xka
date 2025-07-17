import React, { ReactNode, useState, memo, useMemo, useCallback } from 'react';
import { MdExpandMore, MdExpandLess, MdKeyboardArrowRight, MdKeyboardArrowDown } from 'react-icons/md';

import { WorkflowNodeWrapperProps, ExecutionData } from "@/app/lib/types/types"

// Constantes pour éviter les recalculs
const STATUS_COLORS = {
    running: 'border-yellow-400 shadow-yellow-400/20',
    success: 'border-green-400 shadow-green-400/20',
    error: 'border-red-400 shadow-red-400/20',
    default: 'border-zinc-600/50 shadow-lg'
} as const;

const STATUS_ICONS = {
    running: <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />,
    success: <div className="w-3 h-3 bg-green-400 rounded-full" />,
    error: <div className="w-3 h-3 bg-red-400 rounded-full" />,
    default: <div className="w-3 h-3 bg-zinc-500 rounded-full" />
} as const;

const PRIMITIVE_COLORS = {
    string: 'text-green-300',
    number: 'text-blue-300',
    boolean: 'text-purple-300',
    null: 'text-zinc-400',
    undefined: 'text-zinc-400'
} as const;

// Styles CSS inline pour éviter les recalculs
const scrollbarStyles = `
  .custom-scrollbar-node {
    scrollbar-width: thin;
    scrollbar-color: rgba(113, 113, 122, 0.5) rgba(39, 39, 42, 0.3);
  }
  .custom-scrollbar-node::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar-node::-webkit-scrollbar-track {
    background: rgba(39, 39, 42, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar-node::-webkit-scrollbar-thumb {
    background: rgba(113, 113, 122, 0.5);
    border-radius: 3px;
    transition: background 0.2s ease;
  }
  .custom-scrollbar-node::-webkit-scrollbar-thumb:hover {
    background: rgba(113, 113, 122, 0.8);
  }
`;

// Composant JsonViewer optimisé avec virtualisation pour les grandes listes
const JsonViewer = memo(({ data, level = 0 }: { data: any; level?: number }) => {
    const [collapsed, setCollapsed] = useState(level > 1);

    // Gestion des types primitifs
    if (data === null) return <span className={PRIMITIVE_COLORS.null}>null</span>;
    if (data === undefined) return <span className={PRIMITIVE_COLORS.undefined}>undefined</span>;

    const dataType = typeof data;
    if (dataType === 'string') {
        const displayStr = data.length > 100 ? `${data.substring(0, 100)}...` : data;
        return <span className={PRIMITIVE_COLORS.string}>"{displayStr}"</span>;
    }
    if (dataType === 'number') return <span className={PRIMITIVE_COLORS.number}>{data}</span>;
    if (dataType === 'boolean') return <span className={PRIMITIVE_COLORS.boolean}>{data.toString()}</span>;

    // Gestion des tableaux
    if (Array.isArray(data)) {
        if (data.length === 0) return <span className="text-zinc-400">[]</span>;

        const toggleCollapsed = useCallback(() => setCollapsed(!collapsed), [collapsed]);

        return (
            <div className="ml-2">
                <button
                    onClick={toggleCollapsed}
                    className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                >
                    {collapsed ? <MdKeyboardArrowRight size={14} /> : <MdKeyboardArrowDown size={14} />}
                    Array[{data.length}]
                </button>
                {!collapsed && (
                    <div className="ml-4 border-l border-zinc-700 pl-2 mt-1">
                        {data.slice(0, 10).map((item, index) => (
                            <div key={index} className="py-1">
                                <span className="text-zinc-500 text-xs">[{index}]: </span>
                                <JsonViewer data={item} level={level + 1} />
                            </div>
                        ))}
                        {data.length > 10 && (
                            <div className="text-zinc-500 text-xs py-1">
                                ... and {data.length - 10} more items
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Gestion des objets
    if (dataType === 'object') {
        const keys = Object.keys(data);
        if (keys.length === 0) return <span className="text-zinc-400">{'{}'}</span>;

        const toggleCollapsed = useCallback(() => setCollapsed(!collapsed), [collapsed]);

        return (
            <div className="ml-2">
                <button
                    onClick={toggleCollapsed}
                    className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                >
                    {collapsed ? <MdKeyboardArrowRight size={14} /> : <MdKeyboardArrowDown size={14} />}
                    Object{'{'}...{'}'}
                </button>
                {!collapsed && (
                    <div className="ml-4 border-l border-zinc-700 pl-2 mt-1">
                        {keys.slice(0, 20).map(key => (
                            <div key={key} className="py-1">
                                <span className="text-orange-300 text-sm">"{key}"</span>
                                <span className="text-zinc-500">: </span>
                                <JsonViewer data={data[key]} level={level + 1} />
                            </div>
                        ))}
                        {keys.length > 20 && (
                            <div className="text-zinc-500 text-xs py-1">
                                ... and {keys.length - 20} more properties
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return <span className="text-zinc-300">{String(data)}</span>;
});

// Composant pour l'affichage des onglets
const TabNavigation = memo(({
    executionData,
    activeTab,
    setActiveTab
}: {
    executionData: ExecutionData;
    activeTab: 'result' | 'logs' | 'meta';
    setActiveTab: (tab: 'result' | 'logs' | 'meta') => void;
}) => {
    const tabs = useMemo(() => {
        const availableTabs = [];

        if (executionData.result) {
            availableTabs.push({ id: 'result', label: 'Result' });
        }
        if (executionData.logs?.length && executionData.logs.length > 0) {
            availableTabs.push({ id: 'logs', label: `Logs (${executionData.logs.length})` });
        }
        if (executionData.meta && Object.keys(executionData.meta).length > 0) {
            availableTabs.push({ id: 'meta', label: 'Meta' });
        }

        return availableTabs;
    }, [executionData.result, executionData.logs, executionData.meta]);

    return (
        <div className="flex border-b border-zinc-700">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'result' | 'logs' | 'meta')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                        ? 'text-white border-b-2 border-blue-400 bg-zinc-800/50'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
});

// Composant pour le contenu des onglets
const TabContent = memo(({
    activeTab,
    executionData
}: {
    activeTab: 'result' | 'logs' | 'meta';
    executionData: ExecutionData;
}) => {
    const renderContent = useMemo(() => {
        switch (activeTab) {
            case 'result':
                return executionData.result ? (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-zinc-300 mb-2">Execution Result</h4>
                        <div className="bg-zinc-800 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                            <JsonViewer data={executionData.result} />
                        </div>
                    </div>
                ) : null;

            case 'logs':
                return executionData.logs && executionData.logs.length > 0 ? (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-zinc-300 mb-2">Execution Logs</h4>
                        <div className="space-y-2">
                            {executionData.logs.map((log, index) => (
                                <div key={index} className="bg-zinc-800 rounded px-3 py-2 font-mono text-xs text-zinc-300 border-l-2 border-zinc-600">
                                    <span className="text-zinc-500 mr-2">[{index + 1}]</span>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'meta':
                return executionData.meta && Object.keys(executionData.meta).length > 0 ? (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-zinc-300 mb-2">Metadata</h4>
                        <div className="bg-zinc-800 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                            <JsonViewer data={executionData.meta} />
                        </div>
                    </div>
                ) : null;

            default:
                return null;
        }
    }, [activeTab, executionData]);

    return (
        <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar-node">
            {renderContent}
        </div>
    );
});

// Composant principal optimisé
const WorkflowNodeWrapper = memo(function WorkflowNodeWrapper({
    data,
    children
}: WorkflowNodeWrapperProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'result' | 'logs' | 'meta'>('result');

    // Extraction des données d'exécution
    const executionData = useMemo(() => data?.data || {}, [data?.data]);
    const status = useMemo(() =>
        data?.executionStatus || executionData?.status || 'pending',
        [data?.executionStatus, executionData?.status]
    );

    // Calculs de style mémoïsés
    const statusColor = useMemo(() =>
        STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default,
        [status]
    );

    const statusIcon = useMemo(() =>
        STATUS_ICONS[status as keyof typeof STATUS_ICONS] || STATUS_ICONS.default,
        [status]
    );

    // Fonctions utilitaires mémoïsées
    const formatTimestamp = useCallback((timestamp: number) =>
        new Date(timestamp * 1000).toLocaleString(), []
    );

    const formatDuration = useCallback((ms: number) =>
        ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`, []
    );

    const toggleExpansion = useCallback(() => setIsExpanded(!isExpanded), [isExpanded]);

    // Vérification des données d'exécution
    const hasExecutionData = useMemo(() =>
        Boolean(executionData.result || executionData.logs?.length ||
            (executionData.meta && Object.keys(executionData.meta).length > 0)),
        [executionData.result, executionData.logs, executionData.meta]
    );

    // Classes CSS calculées
    const containerClasses = useMemo(() => `
    relative 
    bg-gradient-to-br from-zinc-900 to-zinc-800 
    rounded-xl 
    border-2 
    ${statusColor}
    ${isExpanded ? 'w-[500px]' : 'w-80'}
    text-white 
    shadow-xl
    transition-all 
    duration-300 
    hover:shadow-2xl
    hover:brightness-110
  `, [statusColor, isExpanded]);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
            <div className={containerClasses}>
                {/* Contenu principal du nœud */}
                <div className="p-4">
                    {children}

                    {/* Barre de statut d'exécution */}
                    {hasExecutionData && (
                        <div className="mt-3 pt-3 border-t border-zinc-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    {statusIcon}
                                    <span className="text-zinc-300 capitalize">{status}</span>
                                    {executionData.durationMs && (
                                        <span className="text-zinc-500">
                                            • {formatDuration(executionData.durationMs)}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={toggleExpansion}
                                    className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-zinc-700"
                                    title={isExpanded ? 'Collapse details' : 'Expand details'}
                                >
                                    {isExpanded ? <MdExpandLess size={16} /> : <MdExpandMore size={16} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Détails d'exécution étendus */}
                {isExpanded && hasExecutionData && (
                    <div className="border-t border-zinc-700 bg-zinc-900/50">
                        <TabNavigation
                            executionData={executionData}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                        <TabContent activeTab={activeTab} executionData={executionData} />

                        {/* Pied de page avec informations d'exécution */}
                        <div className="border-t border-zinc-700 px-4 py-3 text-xs text-zinc-400 bg-zinc-900/30">
                            <div className="grid grid-cols-2 gap-2">
                                {executionData.nodeId && (
                                    <div>
                                        <span className="text-zinc-500">Node ID:</span>
                                        <span className="font-mono ml-1 text-zinc-300">{executionData.nodeId}</span>
                                    </div>
                                )}
                                {executionData.nodeType && (
                                    <div>
                                        <span className="text-zinc-500">Type:</span>
                                        <span className="font-mono ml-1 text-zinc-300">{executionData.nodeType}</span>
                                    </div>
                                )}
                                {executionData.timestamp && (
                                    <div className="col-span-2">
                                        <span className="text-zinc-500">Executed:</span>
                                        <span className="ml-1 text-zinc-300">{formatTimestamp(executionData.timestamp)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
});

export default WorkflowNodeWrapper;