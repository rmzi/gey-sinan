import { View, Text, Pressable } from 'react-native';
import { ScriptType } from '@/lib/types';
import { useProgress } from '@/stores/useProgress';

interface ScriptToggleProps {
  className?: string;
}

export default function ScriptToggle({ className = '' }: ScriptToggleProps) {
  const { settings, setScript } = useProgress();

  const scripts: { key: ScriptType; label: string; fontFamily?: string }[] = [
    { key: 'latin', label: 'Latin' },
    { key: 'ethiopic', label: 'ገዕዝ', fontFamily: 'NotoSansEthiopic-Regular' },
    { key: 'arabic', label: 'عربي', fontFamily: 'Amiri-Regular' },
  ];

  return (
    <View className={`flex-row gap-1 p-1 bg-gray-100 rounded-lg ${className}`}>
      {scripts.map(({ key, label, fontFamily }) => {
        const isActive = settings.script === key;
        return (
          <Pressable
            key={key}
            onPress={() => setScript(key)}
            className={`flex-1 px-3 py-1.5 rounded-md items-center justify-center ${
              isActive ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text
              style={fontFamily ? { fontFamily } : undefined}
              className={`text-sm font-medium ${
                isActive ? 'text-emerald-700' : 'text-gray-600'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
