import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react-native";

import { BannerSlider, BannerItem } from "../../components/BannerSlider";
import { SectionHeader } from "../../components/SectionHeader";
import { DoctorCard, Doctor } from "../../components/DoctorCard";
import { PharmacyCard, Pharmacy } from "../../components/PharmacyCard";
import { ArticleCard, Article } from "../../components/ArticleCard";
import { BottomNavBar } from "../../components/BottomNavBar";
import { AlertBox } from "../../components/AlertBox";
import api from "../../lib/axios";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ═══════════════════════════════════════════════════════════
//  Mock Data
// ═══════════════════════════════════════════════════════════

const BANNER_ITEMS: BannerItem[] = [
  { id: "1", image: require("../../assets/images/Banner Slider1.png") },
  { id: "2", image: require("../../assets/images/Banner Slider1.png") },
  { id: "3", image: require("../../assets/images/Banner Slider1.png") },
  { id: "4", image: require("../../assets/images/Banner Slider1.png") },
  { id: "5", image: require("../../assets/images/Banner Slider1.png") },
];

const MOCK_DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "د. خالد ناصر",
    specialty: "باطنية وقلب",
    location: "تعز - المطفر",
    image: require("../../assets/images/doctor.png"),
  },
  {
    id: "2",
    name: "د. سارة أحمد",
    specialty: "أطفال",
    location: "صنعاء - الصفاء",
    image: require("../../assets/images/doctor.png"),
  },
  {
    id: "3",
    name: "د. علي محمد",
    specialty: "نساء وولادة",
    location: "تعز - برياضة",
    image: require("../../assets/images/doctor.png"),
  },
  {
    id: "4",
    name: "د. نورة سالم",
    specialty: "جلدية",
    location: "عدن - المنصورة",
    image: require("../../assets/images/doctor.png"),
  },
];

const MOCK_PHARMACIES: Pharmacy[] = [
  {
    id: "1",
    name: "صيدلية فارما",
    isOpen: true,
    location: "تعز - برياضة",
    image: require("../../assets/images/pharmacy.png"),
  },
  {
    id: "2",
    name: "صيدلية النور",
    isOpen: false,
    location: "تعز - الجوبان",
    image: require("../../assets/images/pharmacy.png"),
  },
  {
    id: "3",
    name: "صيدلية الشفاء",
    isOpen: true,
    location: "صنعاء - الصفاء",
    image: require("../../assets/images/pharmacy.png"),
  },
  {
    id: "4",
    name: "صيدلية الأمل",
    isOpen: false,
    location: "عدن - كريتر",
    image: require("../../assets/images/pharmacy.png"),
  },
];

const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    title: "كيف تحافظ على صحة قلبك في ظل ضغوط الحياة اليومية؟",
    category: "صحة قلبية",
    categoryColor: "#E11D48",
    author: "د. سارة أحمد",
    timeAgo: "منذ 3 أيام",
    image: require("../../assets/images/Banner Slider1.png"),
  },
  {
    id: "2",
    title: "فوائد ممارسة الرياضة يومياً على صحة الجسم والعقل",
    category: "لياقة بدنية",
    categoryColor: "#2B9C8E",
    author: "د. خالد ناصر",
    timeAgo: "منذ أسبوع",
    image: require("../../assets/images/Banner Slider1.png"),
  },
];

// ═══════════════════════════════════════════════════════════
//  API — Fetch profile
// ═══════════════════════════════════════════════════════════
const fetchProfile = async () => {
  const token = await SecureStore.getItemAsync("patientToken");
  if (!token) throw new Error("no_token");
  const data: any = await api.get("/api/patient/auth/me");
  return data?.data?.profile ?? null;
};

// ═══════════════════════════════════════════════════════════
//  Screen
// ═══════════════════════════════════════════════════════════
export default function PatientHome() {
  const insets = useSafeAreaInsets();
  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ["patientProfile"],
    queryFn: fetchProfile,
    retry: 1,
  });

  // ── Animated Collapsible Header ──
  const scrollY = useRef(new Animated.Value(0)).current;

  const HEADER_MAX_HEIGHT = 230;
  const HEADER_MIN_HEIGHT = insets.top + 80;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  // These animations cannot be expressed in NativeWind — kept as Animated interpolations
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE],
    extrapolate: "clamp",
  });

  const cornerCoverOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 1.5],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const greetingTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -15],
    extrapolate: "clamp",
  });

  // Auth guard
  useEffect(() => {
    if (isError && (error as Error)?.message === "no_token") {
      router.replace("/");
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F4FAFA]">
        <ActivityIndicator size="large" color="#2B9C8E" />
      </View>
    );
  }

  const displayName = profile?.fullName || profile?.firstName || "بك";
  const showError =
    isError && (error as Error)?.message !== "no_token"
      ? "تعذّر تحميل البيانات. يرجى المحاولة لاحقاً."
      : null;

  return (
    <View className="flex-1 bg-[#F4FAFA]">

      {/* ── Global Error Toast ── */}
      {showError && <AlertBox visible type="error" message={showError} />}

      {/* ═══════════ HEADER BACKGROUND & GREETING ═══════════ */}
      {/*
        Animated.View transform/opacity interpolations cannot be expressed in
        NativeWind — kept as inline style. Static visual properties are in className.
      */}
      <Animated.View
        className="absolute top-0 left-0 right-0 bg-[#2B9C8E] px-5 rounded-bl-[40px] rounded-br-[40px]"
        style={[
          {
            height: HEADER_MAX_HEIGHT,
            paddingTop: insets.top + 70,
            // Shadow — not supported by NativeWind on Android
            shadowColor: "#2B9C8E",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 18,
            elevation: 8,
            zIndex: 5,
          },
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        {/* Square corner cover to flatten radius on scroll */}
        <Animated.View
          className="absolute bottom-0 left-0 right-0 h-10 bg-[#2B9C8E]"
          style={{ opacity: cornerCoverOpacity }}
        />

        {/* Greeting block */}
        <Animated.View
          className="items-start"
          style={{
            opacity: greetingOpacity,
            transform: [{ translateY: greetingTranslateY }],
          }}
        >
          <Text
            className="text-sm text-white/85 mb-0.5 text-right"
            style={{ fontFamily: "Bein" }}
          >
            مرحباً بك،
          </Text>
          <Text
            className="text-[22px] text-white mb-1 text-right"
            style={{ fontFamily: "Bein-Black" }}
          >
            {displayName} 👋
          </Text>
          <Text
            className="text-[13px] text-white/75 text-right"
            style={{ fontFamily: "Bein" }}
          >
            صحتك أولويتنا — كيف يمكننا مساعدتك اليوم؟
          </Text>
        </Animated.View>
      </Animated.View>

      {/* ═══════════ FIXED TOP ROW (Logo & Bell) ═══════════ */}
      <View
        className="absolute top-0 left-0 right-0 flex-row justify-between items-center px-5"
        style={{ paddingTop: insets.top + 16, zIndex: 10 }}
      >
        {/* Logo */}
        <View className="w-[140px] h-11  overflow-hidden justify-center items-center">
          <Image
            source={require("../../assets/images/logo.png")}
            // Width/height cannot be set to arbitrary px values via NativeWind
            // without extending the config — kept as inline style
            style={{ width: 240, height: 100, tintColor: "#ffffff" }}
            resizeMode="contain"
            className="mt-2"
          />
        </View>

        {/* Bell button */}
        <Pressable
          className="w-[38px] h-[38px] rounded-full bg-white justify-center items-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={() => { }}
        >
          <Bell size={20} color="#2B9C8E" />
          {/* Notification dot */}
          <View
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E11D48]"
            style={{ borderWidth: 1.5, borderColor: "#fff" }}
          />
        </Pressable>
      </View>

      {/* ═══════════ SCROLL CONTENT ═══════════ */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT + 24,
          paddingBottom: 20,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* ── Banner Slider ── */}
        <BannerSlider items={BANNER_ITEMS} />

        {/* ── Doctors ── */}
        <View className="h-8" />
        <SectionHeader title="أطباء ميدي هب" onPressAll={() => { }} />
        <FlatList
          data={MOCK_DOCTORS}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          renderItem={({ item }) => (
            <DoctorCard doctor={item} onPress={() => { }} />
          )}
        />

        {/* ── Pharmacies ── */}
        <View className="h-8" />
        <SectionHeader title="صيدليات ميدي هب" onPressAll={() => { }} />
        <FlatList
          data={MOCK_PHARMACIES}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          renderItem={({ item }) => (
            <PharmacyCard pharmacy={item} onPress={() => { }} />
          )}
        />

        
        <View className="h-8" />
        <SectionHeader title="مقالات تهمك" onPressAll={() => { }} />
        <FlatList
          data={MOCK_ARTICLES}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SCREEN_WIDTH * 0.85 + 10} // card width + gap
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          renderItem={({ item }) => (
            /*
              Wrap ArticleCard in a fixed-width View so the card never collapses
              or stretches regardless of whether an image is present.
            */
            <View style={{ width: SCREEN_WIDTH * 0.85 }}>
              <ArticleCard article={item} onPress={() => { }} />
            </View>
          )}
        />

        <View className="h-5" />
      </Animated.ScrollView>

      {/* ═══════════ BOTTOM NAV ═══════════ */}
      <BottomNavBar activeTab="home" />
    </View>
  );
}