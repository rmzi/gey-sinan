'use client';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'blue' | 'amber';
}

export default function ProgressBar({
  progress,
  className = '',
  showLabel = false,
  size = 'md',
  color = 'emerald',
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className={className}>
      <div
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heightClasses[size]}`}
      >
        <div
          className={`${colorClasses[color]} ${heightClasses[size]} rounded-full transition-all duration-300`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
}
