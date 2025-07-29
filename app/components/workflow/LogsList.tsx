import { memo } from 'react';
import { LogItem } from '@/app/lib/types/types';

// Constantes extraites pour éviter les recréations
const EMPTY_STATE = (
  <div className="text-center text-zinc-500 text-xs py-4">
    No logs available for the selected filter
  </div>
);

const WORKFLOW_STYLE = 'border-blue-400 text-blue-400';
const NODE_STYLE = 'border-zinc-600 text-zinc-500';
const BASE_STYLE = 'bg-zinc-800 rounded px-3 py-2 font-mono text-xs text-zinc-300 border-l-2';
const CONTAINER_STYLE = 'space-y-2 custom-scrollbar max-h-80 overflow-y-auto pr-2';

// Composant optimisé
export const LogsList = memo<{ filteredLogs: LogItem[] }>(({ filteredLogs }) => {
  // Early return si pas de logs
  if (filteredLogs.length === 0) {
    return EMPTY_STATE;
  }

  return (
    <div className={CONTAINER_STYLE}>
      {filteredLogs.map((logItem) => {
        const isWorkflow = logItem.type === 'workflow';
        const borderStyle = isWorkflow ? WORKFLOW_STYLE : NODE_STYLE;
        const textStyle = isWorkflow ? WORKFLOW_STYLE.split(' ')[1] : NODE_STYLE.split(' ')[1];

        return (
          <div
            key={`${logItem.type}-${logItem.nodeId || 'workflow'}-${logItem.index}`}
            className={`${BASE_STYLE} ${borderStyle}`}
          >
            <span className={`mr-2 ${textStyle}`}>
              [{isWorkflow ? 'WORKFLOW' : logItem.nodeId}]
            </span>
            {logItem.log}
          </div>
        );
      })}
    </div>
  );
});

LogsList.displayName = 'LogsList';
