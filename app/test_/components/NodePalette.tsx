import React, { useState, useCallback, useMemo, memo, DragEvent } from 'react';
import { ReactFlowInstance } from '@xyflow/react';
import { MdHttp, MdPlayArrow, MdTimer, MdExpandMore, MdExpandLess, MdDragIndicator } from 'react-icons/md';

interface NodeTemplate {
    type: string;
    label: string;
    icon: React.ReactNode;
    description: string;
    defaultData: any;
    color: string;
    dimensions: {
        width: number;
        height: number;
    };
}

interface NodePaletteProps {
    rfInstance: ReactFlowInstance | null;
    onAddNode: (nodeType: string, data: any) => void;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}

// Constantes en dehors du composant pour éviter les re-créations
const NODE_TEMPLATES: NodeTemplate[] = [
    {
        type: 'manualStartNode',
        label: 'Manual Start',
        icon: <MdPlayArrow size={16} />,
        description: 'Démarre le workflow manuellement',
        defaultData: { label: 'Start' },
        color: 'bg-zinc-700',
        dimensions: { width: 320, height: 100 }
    },
    {
        type: 'httpRequestNode',
        label: 'HTTP Request',
        icon: <MdHttp size={16} />,
        description: 'Effectue une requête HTTP',
        defaultData: { method: 'GET', url: 'https://api.example.com' },
        color: 'bg-zinc-700',
        dimensions: { width: 320, height: 140 }
    },
    {
        type: 'waitingNode',
        label: 'Wait',
        icon: <MdTimer size={16} />,
        description: 'Attend pendant une durée définie',
        defaultData: { duration: '1000' },
        color: 'bg-zinc-700',
        dimensions: { width: 320, height: 120 }
    }
];

// Styles CSS en constante pour éviter les re-créations
const SCROLLBAR_STYLES = `
.node-palette-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(113, 113, 122, 0.5) rgba(39, 39, 42, 0.3);
}
.node-palette-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.node-palette-scrollbar::-webkit-scrollbar-track {
    background: rgba(39, 39, 42, 0.3);
    border-radius: 3px;
}
.node-palette-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(113, 113, 122, 0.5);
    border-radius: 3px;
    transition: background 0.2s ease;
}
.node-palette-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(113, 113, 122, 0.8);
}
`;

// Composant NodeItem mémorisé
const NodeItem = memo<{
    template: NodeTemplate;
    onDragStart: (event: DragEvent, template: NodeTemplate) => void;
    onAddNode: (template: NodeTemplate) => void;
}>(({ template, onDragStart, onAddNode }) => {
    const handleDragStart = useCallback((e: DragEvent) => {
        onDragStart(e, template);
    }, [onDragStart, template]);

    const handleClick = useCallback(() => {
        onAddNode(template);
    }, [onAddNode, template]);

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onClick={handleClick}
            className="group cursor-pointer bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-600 hover:border-zinc-500 transition-all duration-200 p-3"
        >
            <div className="flex items-center gap-3">
                <div className={`${template.color} p-2 rounded-lg text-white group-hover:scale-105 transition-transform`}>
                    {template.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm mb-1">{template.label}</h4>
                    <p className="text-zinc-400 text-xs leading-relaxed">{template.description}</p>
                </div>
                <MdDragIndicator className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
            </div>
        </div>
    );
});

NodeItem.displayName = 'NodeItem';

// Composant EmptyState mémorisé
const EmptyState = memo<{ searchTerm: string }>(({ searchTerm }) => (
    <div className="text-center py-8">
        <div className="text-zinc-500 text-2xl mb-2">⌕</div>
        <p className="text-zinc-400 text-sm">Aucun résultat pour "{searchTerm}"</p>
    </div>
));

EmptyState.displayName = 'EmptyState';

// Composant principal
export const NodePalette: React.FC<NodePaletteProps> = memo(({
    rfInstance,
    onAddNode,
    isOpen: controlledIsOpen,
    onToggle
}) => {
    const [internalIsOpen, setInternalIsOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const setIsOpen = onToggle || setInternalIsOpen;

    // Filtrage mémorisé avec debounce virtuel
    const filteredTemplates = useMemo(() => {
        if (!searchTerm.trim()) return NODE_TEMPLATES;

        const term = searchTerm.toLowerCase();
        return NODE_TEMPLATES.filter(template =>
            template.label.toLowerCase().includes(term) ||
            template.description.toLowerCase().includes(term)
        );
    }, [searchTerm]);

    // Callbacks mémorisés
    const handleAddNode = useCallback((template: NodeTemplate) => {
        if (!rfInstance) return;

        const viewport = rfInstance.getViewport();
        const position = {
            x: Math.random() * 400 - viewport.x,
            y: Math.random() * 400 - viewport.y
        };

        onAddNode(template.type, {
            ...template.defaultData,
            position
        });
    }, [rfInstance, onAddNode]);

    const onDragStart = useCallback((event: DragEvent, template: NodeTemplate) => {
        event.dataTransfer.setData('application/reactflow', template.type);
        event.dataTransfer.setData('application/json', JSON.stringify(template.defaultData));
        event.dataTransfer.setData('application/dimensions', JSON.stringify(template.dimensions));
        event.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleToggleClose = useCallback(() => {
        setIsOpen(false);
    }, [setIsOpen]);

    const handleToggleOpen = useCallback(() => {
        setIsOpen(true);
    }, [setIsOpen]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    // Rendu conditionnel optimisé
    if (!isOpen) {
        return (
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={handleToggleOpen}
                    className="bg-gradient-to-br from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 text-white p-3 rounded-lg shadow-xl border border-zinc-700 transition-all duration-200 hover:scale-105"
                    title="Ouvrir la palette de nodes"
                >
                    <MdExpandMore size={20} />
                </button>
            </div>
        );
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: SCROLLBAR_STYLES }} />

            <div className="absolute top-0 right-0 z-10 bg-gradient-to-br from-zinc-900 to-zinc-800 border-l border-zinc-700 shadow-xl w-80 h-full flex flex-col">
                {/* Header optimisé */}
                <div className="p-4 border-b border-zinc-700">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-lg">Nodes</h3>
                        <button
                            onClick={handleToggleClose}
                            className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-zinc-700"
                            title="Fermer"
                        >
                            <MdExpandLess size={20} />
                        </button>
                    </div>

                    <p className="text-zinc-400 text-sm mb-3">Cliquez pour ajouter au workflow</p>

                    {/* Search Bar optimisée */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 text-sm">
                            ⌕
                        </div>
                    </div>
                </div>

                {/* Liste des nodes optimisée */}
                <div className="flex-1 overflow-y-auto node-palette-scrollbar">
                    <div className="p-3 space-y-2">
                        {filteredTemplates.length > 0 ? (
                            filteredTemplates.map((template) => (
                                <NodeItem
                                    key={template.type}
                                    template={template}
                                    onDragStart={onDragStart}
                                    onAddNode={handleAddNode}
                                />
                            ))
                        ) : (
                            <EmptyState searchTerm={searchTerm} />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-zinc-700 bg-zinc-900/30">
                    <p className="text-zinc-500 text-xs">
                        Glissez les nodes sur le canvas
                    </p>
                </div>
            </div>
        </>
    );
});

NodePalette.displayName = 'NodePalette';