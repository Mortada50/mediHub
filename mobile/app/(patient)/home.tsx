import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

export default function PatientHome() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync("patientToken");
        if (!token) {
          router.replace("/");
          return;
        }

        const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://medihub-backend-m32h.onrender.com";
        const res = await fetch(`${apiUrl}/api/patient/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Bypass-Tunnel-Reminder": "true"
          },
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setProfile(data.data.profile);
        } else {
          // Token invalid or expired
          await SecureStore.deleteItemAsync("patientToken");
          router.replace("/");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("patientToken");
    router.replace("/");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2B9C8E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#EAF5F4", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontFamily: "Bein", fontSize: 24, color: "#2B9C8E", marginBottom: 20 }}>
        مرحباً {profile?.fullName || profile?.firstName || "بك"} ✅
      </Text>
      
      <Text style={{ fontFamily: "Bein", fontSize: 16, color: "#2F3541", marginBottom: 40 }}>
        تم تسجيل الدخول بنجاح كمريض
      </Text>

      <Pressable
        onPress={handleLogout}
        style={{
          backgroundColor: "#ff4d4f",
          paddingHorizontal: 30,
          paddingVertical: 12,
          borderRadius: 20,
        }}
      >
        <Text style={{ fontFamily: "Bein", color: "white", fontSize: 16 }}>تسجيل الخروج</Text>
      </Pressable>
    </SafeAreaView>
  );
}
