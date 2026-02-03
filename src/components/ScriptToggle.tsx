'use client';

import { ScriptType } from '@/lib/types';
import { useProgress } from '@/stores/useProgress';

interface ScriptToggleProps {
  className?: string;
}

const scriptLabels: Record<ScriptType, string> = {
  latin: 'Latin',
  ethiopic: 'Ge\'ez',
  arabic: 'Arabic',
};

export default function ScriptToggle({ className = '' }: ScriptToggleProps) {
  const { settings, setScript } = useProgress();

  return (
    <div className={`flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
      {(['latin', 'ethiopic', 'arabic'] as ScriptType[]).map((script) => (
        <button
          key={script}
          onClick={() => setScript(script)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-colors
            ${settings.script === script
              ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
        >
          {scriptLabels[script]}
        </button>
      ))}
    </div>
  );
}
