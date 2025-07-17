import { memo } from 'react';
import { LogItem } from '@/app/lib/types/types';

interface LogsListProps {
  filteredLogs: LogItem[];
}

export const LogsList = memo<LogsListProps>(({ filteredLogs }) => (
  <div className="space-y-2 custom-scrollbar max-h-80 overflow-y-auto pr-2">
    {filteredLogs.length === 0 ? (
      <div className="text-center text-zinc-500 text-xs py-4">
        No logs available for the selected filter
      </div>
    ) : (
      filteredLogs.map((logItem) => (
        <div
          key={`${logItem.type}-${logItem.nodeId || 'workflow'}-${logItem.index}`}
          className={`bg-zinc-800 rounded px-3 py-2 font-mono text-xs text-zinc-300 border-l-2 ${
            logItem.type === 'workflow' ? 'border-blue-400' : 'border-zinc-600'
          }`}
        >
          <span className={`mr-2 ${
            logItem.type === 'workflow' ? 'text-blue-400' : 'text-zinc-500'
          }`}>
            [{logItem.type === 'workflow' ? 'WORKFLOW' : logItem.nodeId}]
          </span>
          {logItem.log}
        </div>
      ))
    )}
  </div>
));

LogsList.displayName = 'LogsList';