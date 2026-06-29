import { Stack } from "expo-router";
import "../global.css"
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nManager } from 'react-native';

// Force RTL layout for the Arabic app
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch when the app comes to foreground — avoids burst requests
      refetchOnWindowFocus: false,
      // Only retry once on failure (default is 3 which triples the requests)
      retry: 1,
      // Keep data fresh for 5 minutes globally (overridable per hook)
      staleTime: 5 * 60 * 1000,
    },
  },
});

// NOTE: ClerkProvider requires a custom dev build (npx expo run:android).
// It is temporarily disabled to allow UI development on Expo Go.
// To re-enable, uncomment the ClerkProvider import and wrap <Stack /> with it.

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Bein: require('../assets/fonts/beIN Normal Normal.ttf'),
    'Bein-Black': require('../assets/fonts/beIN Black Black.ttf'),
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('patientToken');
        if (token) {
          router.replace('/(patient)/home');
        }
      } catch (e) {
        // Handle error quietly
      }
    };

    if (loaded || error) {
      SplashScreen.hideAsync();
      checkAuth();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
