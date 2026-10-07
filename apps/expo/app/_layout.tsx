import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Amiri-Regular': require('../assets/fonts/Amiri-Regular.ttf'),
    'Amiri-Bold': require('../assets/fonts/Amiri-Bold.ttf'),
    'NotoSansEthiopic-Regular': require('../assets/fonts/NotoSansEthiopic-Regular.ttf'),
    'NotoSansEthiopic-Bold': require('../assets/fonts/NotoSansEthiopic-Bold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

/**
 * On the deployed static site, dictionary.geysinan.com and
 * volunteer.geysinan.com serve the same bundle behind a CloudFront function
 * that rewrites the request path; the SPA itself sees a clean "/" pathname
 * either way. Route to the right screen based on hostname so visiting the
 * bare domain lands somewhere useful. Web-only; native has no hostname.
 */
function useHostBasedLanding() {
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined') return;
    if (pathname !== '/') return;

    const hostname = window.location.hostname;
    if (hostname.startsWith('dictionary')) {
      router.replace('/dictionary' as never);
    } else if (hostname.startsWith('volunteer')) {
      router.replace('/volunteer' as never);
    }
  }, [pathname]);
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  useHostBasedLanding();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="learn/[lessonId]" options={{ headerShown: true, title: 'Lesson' }} />
        <Stack.Screen name="about" options={{ headerShown: true, title: 'About' }} />
        <Stack.Screen name="dictionary/index" options={{ headerShown: false }} />
        <Stack.Screen name="dictionary/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="volunteer/index" options={{ headerShown: false }} />
        <Stack.Screen name="volunteer/record" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
