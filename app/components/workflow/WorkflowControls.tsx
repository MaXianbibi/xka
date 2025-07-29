import { memo, useMemo, useCallback } from 'react';
import { Panel } from '@xyflow/react';
import { MdPlayArrow, MdStop, MdClear } from "react-icons/md";
import { WorkflowControlsProps } from '@/app/lib/types/types';

// Constantes pour les classes CSS réutilisables
const PANEL_CONTAINER_CLASSES = "bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border-2 border-zinc-600/50 shadow-xl p-4 hover:shadow-2xl hover:brightness-110 transition-all duration-300";
const BUTTON_BASE_CLASSES = "flex items-center gap-3 px-5 py-3 rounded-lg font-medium transition-all duration-200";
const BUTTON_SECONDARY_CLASSES = "flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200";
const SPINNER_CLASSES = "w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin";

// Constantes pour les styles des boutons
const BUTTON_STYLES = {
  run: {
    active: 'bg-indigo-500/25 text-indigo-200 hover:bg-indigo-500/35 hover:text-white',
    disabled: 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
  },
  stop: 'bg-red-500/25 text-red-200 hover:bg-red-500/35 hover:text-white',
  clear: 'bg-zinc-700/60 text-zinc-200 hover:bg-zinc-600/60 hover:text-white'
} as const;

// Composant pour l'icône de chargement
const LoadingSpinner = memo(() => (
  <div className={SPINNER_CLASSES} />
));

// Composant pour le bouton Run
const RunButton = memo(({ 
  onRunWorkflow, 
  isRunning, 
  isLoading 
}: { 
  onRunWorkflow: () => void; 
  isRunning: boolean; 
  isLoading: boolean; 
}) => {
  const isDisabled = useMemo(() => isRunning || isLoading, [isRunning, isLoading]);
  
  const buttonClass = useMemo(() => 
    `${BUTTON_BASE_CLASSES} ${isDisabled ? BUTTON_STYLES.run.disabled : BUTTON_STYLES.run.active}`,
    [isDisabled]
  );

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      onRunWorkflow();
    }
  }, [onRunWorkflow, isDisabled]);

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={buttonClass}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <span className="text-sm">Running workflow...</span>
        </>
      ) : (
        <>
          <MdPlayArrow size={20} />
          <span className="text-sm">Run Workflow</span>
        </>
      )}
    </button>
  );
});

// Composant pour le bouton Stop
const StopButton = memo(({ 
  onStopPolling, 
  shouldPoll 
}: { 
  onStopPolling: () => void; 
  shouldPoll: boolean; 
}) => {
  const handleClick = useCallback(() => {
    onStopPolling();
  }, [onStopPolling]);

  if (!shouldPoll) return null;

  return (
    <button
      onClick={handleClick}
      className={`${BUTTON_SECONDARY_CLASSES} ${BUTTON_STYLES.stop}`}
    >
      <MdStop size={18} />
      <span className="text-sm">Stop</span>
    </button>
  );
});

// Composant pour le bouton Clear
const ClearButton = memo(({ 
  onClearWorkflow, 
  workflowId, 
  shouldPoll 
}: { 
  onClearWorkflow: () => void; 
  workflowId: string | null | undefined; 
  shouldPoll: boolean; 
}) => {
  const handleClick = useCallback(() => {
    onClearWorkflow();
  }, [onClearWorkflow]);

  const shouldShow = useMemo(() => workflowId && !shouldPoll, [workflowId, shouldPoll]);

  if (!shouldShow) return null;

  return (
    <button
      onClick={handleClick}
      className={`${BUTTON_SECONDARY_CLASSES} ${BUTTON_STYLES.clear}`}
    >
      <MdClear size={18} />
    </button>
  );
});

// Composant pour le conteneur des boutons
const ButtonContainer = memo(({ 
  onRunWorkflow,
  onStopPolling,
  onClearWorkflow,
  isRunning,
  isLoading,
  shouldPoll,
  workflowId
}: WorkflowControlsProps) => (
  <div className="flex items-center gap-3">
    <RunButton 
      onRunWorkflow={onRunWorkflow}
      isRunning={isRunning}
      isLoading={isLoading}
    />
    
    <StopButton 
      onStopPolling={onStopPolling}
      shouldPoll={shouldPoll}
    />
    
    <ClearButton 
      onClearWorkflow={onClearWorkflow}
      workflowId={workflowId}
      shouldPoll={shouldPoll}
    />
  </div>
));

// Composant principal optimisé
export const WorkflowControls = memo<WorkflowControlsProps>(({
  onRunWorkflow,
  onStopPolling,
  onClearWorkflow,
  isRunning,
  isLoading,
  shouldPoll,
  workflowId
}) => (
  <Panel position="bottom-center">
    <div className={PANEL_CONTAINER_CLASSES}>
      <ButtonContainer
        onRunWorkflow={onRunWorkflow}
        onStopPolling={onStopPolling}
        onClearWorkflow={onClearWorkflow}
        isRunning={isRunning}
        isLoading={isLoading}
        shouldPoll={shouldPoll}
        workflowId={workflowId}
      />
    </div>
  </Panel>
));

WorkflowControls.displayName = 'WorkflowControls';