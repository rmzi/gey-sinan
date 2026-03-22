import { View } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-1
  className?: string;
}

export default function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View className={`w-full bg-gray-200 rounded-full overflow-hidden h-2.5 ${className}`}>
      <View
        className="bg-emerald-500 h-2.5 rounded-full"
        style={{ width: `${clampedProgress * 100}%` }}
      />
    </View>
  );
}
