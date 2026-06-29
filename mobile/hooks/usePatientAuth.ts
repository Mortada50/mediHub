import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as LinkingExpo from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { usePatientAuthApi } from '../services/patientAuth.service';

export const usePatientAuth = () => {
  const { getGoogleAuthStartUrl } = usePatientAuthApi();

  const googleSignInMutation = useMutation({
    mutationFn: async () => {
      const returnUrl = LinkingExpo.createURL("auth");
      const startUrl = getGoogleAuthStartUrl(returnUrl);
      const result = await WebBrowser.openAuthSessionAsync(startUrl, returnUrl);

      if (result.type === "success" && result.url) {
        const url = result.url;
        const tokenMatch = url.match(/[?&]token=([^&]*)/);
        const errorMatch = url.match(/[?&]error=([^&]*)/);

        if (tokenMatch?.[1]) {
          const token = decodeURIComponent(tokenMatch[1]);
          await SecureStore.setItemAsync("patientToken", token);
          return token;
        } else if (errorMatch?.[1]) {
          throw new Error("حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة لاحقاً.");
        }
      } else if (result.type === "cancel") {
         return null;
      }
      throw new Error("فشلت عملية المصادقة، يرجى المحاولة مرة أخرى.");
    },
    onSuccess: (token) => {
      if (token) {
        router.replace("/(patient)/home");
      }
    },
    onError: (error) => {
      console.error("Google sign-in error:", error);
    }
  });

  useEffect(() => {
    if (googleSignInMutation.error) {
      const timer = setTimeout(() => {
        googleSignInMutation.reset();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [googleSignInMutation.error]);

  const handleGoogleSignIn = () => {
    googleSignInMutation.mutate();
  };

  const handleSkipLogin = () => {
    router.replace("/(patient)/home");
  };

  return {
    handleGoogleSignIn,
    handleSkipLogin,
    isLoading: googleSignInMutation.isPending,
    error: googleSignInMutation.error?.message || null,
  };
};
