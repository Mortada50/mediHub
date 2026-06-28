import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Pressable,
  Image,
  Linking,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

WebBrowser.maybeCompleteAuthSession();
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Stethoscope, Pill } from "lucide-react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// --- External Registration URLs ---
const DOCTOR_REGISTER_URL = "https://medihub.example.com/register/doctor";
const PHARMACY_REGISTER_URL = "https://medihub.example.com/register/pharmacy";

export default function Index() {
  const [activeTab, setActiveTab] = useState<"doctor" | "pharmacy">("doctor");
  const [loading, setLoading] = useState(false);

  // --- Google OAuth ---
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://medihub-backend-m32h.onrender.com";
  
  // Create redirect URI back to our app (exp://...)
  const appRedirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: "71001537502-hncd7qf4nqbvobso32demp30n93j05kt.apps.googleusercontent.com",
      // Redirect to backend proxy to bypass Google's exp:// restriction
      redirectUri: `${apiUrl}/api/patient/auth/callback`,
      responseType: AuthSession.ResponseType.IdToken,
      scopes: ["openid", "profile", "email"],
      // Pass the app's redirect URI in the state parameter
      state: encodeURIComponent(appRedirectUri),
      usePKCE: false,
      extraParams: {
        nonce: "defaultNonce12345",
      }
    },
    {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
    }
  );

  useEffect(() => {
    if (response?.type === "success") {
      // The proxy redirects back to us with the id_token in params
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleLogin(id_token);
      }
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/patient/auth/google`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true" 
        },
        body: JSON.stringify({ idToken }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        await SecureStore.setItemAsync("patientToken", data.data.token);
        // Navigate to patient home
        router.replace("/(patient)/home");
      } else {
        console.error("Login failed:", data.message);
        // Here we could show an alert to the user
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Entrance Animations ---
  const fadeAnim = useSharedValue(0);
  const logoSlide = useSharedValue(-20);
  const heroSlide = useSharedValue(50);
  const cardSlide = useSharedValue(80);

  // --- Segmented Indicator ---
  const indicatorPos = useSharedValue(0);

  // --- Button Press Scales ---
  const googleScale = useSharedValue(1);
  const appleScale = useSharedValue(1);

  // --- Background Blob Animations ---
  const blob1Y = useSharedValue(0);
  const blob2Y = useSharedValue(0);
  const blob3Scale = useSharedValue(1);

  useEffect(() => {
    // Entrance
    fadeAnim.value = withTiming(1, { duration: 700 });
    logoSlide.value = withDelay(100, withSpring(0, { damping: 16, stiffness: 90 }));
    heroSlide.value = withDelay(250, withSpring(0, { damping: 14, stiffness: 70 }));
    cardSlide.value = withDelay(420, withSpring(0, { damping: 14, stiffness: 70 }));

    // Ambient blob float animations
    blob1Y.value = withRepeat(
      withSequence(
        withTiming(-18, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    blob2Y.value = withRepeat(
      withSequence(
        withTiming(14, { duration: 4500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 4500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    blob3Scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    indicatorPos.value = withSpring(activeTab === "doctor" ? 0 : 1, {
      damping: 22,
      stiffness: 220,
    });
  }, [activeTab]);

  // Animated Styles
  const containerAnim = useAnimatedStyle(() => ({ opacity: fadeAnim.value }));
  const logoAnim = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: logoSlide.value }],
  }));
  const heroAnim = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: heroSlide.value }],
  }));
  const cardAnim = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: cardSlide.value }],
  }));
  const indicatorAnim = useAnimatedStyle(() => ({
    left: `${indicatorPos.value * 50}%`,
  }));

  // Blob animated styles
  const blob1Anim = useAnimatedStyle(() => ({
    transform: [{ translateY: blob1Y.value }],
  }));
  const blob2Anim = useAnimatedStyle(() => ({
    transform: [{ translateY: blob2Y.value }],
  }));
  const blob3Anim = useAnimatedStyle(() => ({
    transform: [{ scale: blob3Scale.value }],
  }));

  const googleAnim = useAnimatedStyle(() => ({
    transform: [{ scale: googleScale.value }],
  }));
  const appleAnim = useAnimatedStyle(() => ({
    transform: [{ scale: appleScale.value }],
  }));

  const handleOpenExternal = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#EAF5F4" }}>

      {/* ── Animated Background Blobs ── */}
      <View style={{ position: "absolute", width: "100%", height: "100%", overflow: "hidden" }}>
        {/* Top-left large blob */}
        <Animated.View
          style={[blob1Anim, {
            position: "absolute",
            top: -80,
            left: -80,
            width: 280,
            height: 280,
            borderRadius: 140,
            backgroundColor: "#2B9C8E18",
          }]}
        />
        {/* Middle-right blob */}
        <Animated.View
          style={[blob2Anim, {
            position: "absolute",
            top: SCREEN_HEIGHT * 0.32,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: "#55B1A512",
          }]}
        />
        {/* Bottom-left small blob */}
        <Animated.View
          style={[blob3Anim, {
            position: "absolute",
            bottom: 100,
            left: -50,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: "#2B9C8E0E",
          }]}
        />
      </View>

      <Animated.View
        style={[containerAnim, { flex: 1, paddingHorizontal: 24, paddingTop: 35, paddingBottom: 20 }]}
      >
        {/* ── Logo ── */}
        <Animated.View style={[logoAnim, { alignItems: "center", marginTop: 16, marginBottom: 4 }]}>
          <Image
            source={require("../assets/images/logo.png")}
            style={{ width: SCREEN_WIDTH * 1.0, height: 150 }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* ── Hero Image ── */}
        <Animated.View
          style={[heroAnim, {
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 0,
            marginBottom: -12,
            paddingRight: 0,
            marginRight: -30,
          }]}
        >
          {/* Soft circle backdrop behind the illustration */}
          <View style={{
            position: "absolute",
            bottom: 0,
            width: SCREEN_WIDTH * 0.75,
            height: SCREEN_WIDTH * 0.75,
            borderRadius: (SCREEN_WIDTH * 0.75) / 2,
            backgroundColor: "#ffffff",
            opacity: 0.25,
          }} />
          <Image
            source={require("../assets/images/Auth Hero.png")}
            style={{
              width: SCREEN_WIDTH * 0.88,
              height: SCREEN_WIDTH * 0.96,
            }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* ── Floating Card ── */}
        <Animated.View
          style={[cardAnim, {
            backgroundColor: "#ffffff",
            borderRadius: 32,
            padding: 22,
            shadowColor: "#1a6b63",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
            elevation: 6,
          }]}
        >
          {/* Card Title */}
          <Text
            style={{
              textAlign: "center",
              fontFamily: "Bein",
              fontSize: 20,
              color: "#2F3541",
              marginBottom: 16,
            }}
          >
            تسجيل الدخول
          </Text>

       

          {/* ── Google Button ── */}
          <AnimatedPressable
            disabled={!request || loading}
            onPress={() => promptAsync()}
            onPressIn={() => { googleScale.value = withSpring(0.96); }}
            onPressOut={() => { googleScale.value = withSpring(1); }}
            style={[googleAnim, {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#E8E8E8",
              borderRadius: 18,
              paddingVertical: 14,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOpacity: 0.03,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }]}
          >
            <Image
              source={require("../assets/images/google.png")}
              style={{ width: 22, height: 22, marginRight: 10 }}
              resizeMode="contain"
            />
            <Text style={{ fontFamily: "Bein", fontSize: 15, color: "#2F3541" }}>
              المتابعة باستخدام Google
            </Text>
          </AnimatedPressable>

          {/* ── Apple Button ── */}
          <AnimatedPressable
            onPressIn={() => { appleScale.value = withSpring(0.96); }}
            onPressOut={() => { appleScale.value = withSpring(1); }}
            style={[appleAnim, {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#111111",
              borderRadius: 18,
              paddingVertical: 14,
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }]}
          >
            <Image
              source={require("../assets/images/apple.png")}
              style={{ width: 22, height: 22, marginRight: 10, tintColor: "#fff" }}
              resizeMode="contain"
            />
            <Text style={{ fontFamily: "Bein", fontSize: 15, color: "#ffffff" }}>
              المتابعة باستخدام Apple
            </Text>
          </AnimatedPressable>

          {/* ── External Registration Links ── */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 18, gap: 20 }}>
            <Pressable
              onPress={() => handleOpenExternal(activeTab === "doctor" ? DOCTOR_REGISTER_URL : PHARMACY_REGISTER_URL)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={{
                fontFamily: "Bein",
                fontSize: 13,
                color: "#2B9C8E",
                textDecorationLine: "underline",
              }}>
                تسجيل كطبيب
              </Text>
            </Pressable>

            <Text style={{ color: "#ccc", fontSize: 13 }}>|</Text>

            <Pressable
              onPress={() => handleOpenExternal(PHARMACY_REGISTER_URL)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={{
                fontFamily: "Bein",
                fontSize: 13,
                color: "#2B9C8E",
                textDecorationLine: "underline",
              }}>
                تسجيل كصيدلية
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}
