import React, { useMemo, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, Heart, Pill } from "lucide-react-native";
import { useRouter } from "expo-router";
import { DRUGCATEGORIES } from "@/utils/constant";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicineService, Medicine } from "../../../services/medicine.service";
import { favoriteService } from "../../../services/favorite.service";
import { AlertBox } from "../../../components/AlertBox";

// ═══════════════════════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════════════════════

const ALL_CATEGORY = "الكل";

// ═══════════════════════════════════════════════════════════
//  Medicine Row Card
// ═══════════════════════════════════════════════════════════

type MedicineRowProps = {
  medicine: Medicine;
  isFavorite: boolean;
  isFavPending: boolean;
  onToggleFavorite: () => void;
  onPress?: () => void;
};

const MedicineRow: React.FC<MedicineRowProps> = ({
  medicine,
  isFavorite,
  isFavPending,
  onToggleFavorite,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="bg-[#F4FAFA] rounded-[22px] p-2 mb-3 flex-row-reverse items-start border border-[#EBF5F4]"
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      {/* Favorite */}
      <Pressable
        hitSlop={10}
        onPress={onToggleFavorite}
        disabled={isFavPending}
        style={{ opacity: isFavPending ? 0.4 : 1 }}
        className="mr-1 items-center justify-center"
      >
        <Heart
          size={22}
          color="#2B9C8E"
          fill={isFavorite ? "#2B9C8E" : "transparent"}
        />
      </Pressable>

      {/* Text Content */}
      <View className="flex-1 items-start px-3">
        <Text
          className="text-[15px] text-gray-600 text-right mb-1"
          style={{ fontFamily: "Bein-Black" }}
        >
          {medicine.nameAr}
        </Text>
        <Text
          className="text-[13px] text-[#7A8A9A] mb-3"
          style={{ fontFamily: "Bein" }}
        >
          {medicine.nameEn}
        </Text>

        <View className="w-full flex-row flex-wrap items-center gap-2">
          {/* Prescription badge */}
          <View
            className={`shrink-0 px-3 py-0.5 rounded-full ${medicine.requiresPrescription
                ? "bg-[#FEE2E2]"
                : "bg-[#E7ECEF]"
              }`}
          >
            <Text
              numberOfLines={1}
              className={`text-[9px] ${medicine.requiresPrescription
                  ? "text-[#DC2626]"
                  : "text-[#5C6B7A]"
                }`}
              style={{ fontFamily: "Bein" }}
            >
              {medicine.requiresPrescription
                ? "يتطلب وصفة طبيه"
                : "لا يتطلب وصفة طبيه"}
            </Text>
          </View>

          {/* Category badge */}
          <View className="shrink-0 px-3 py-0.5 rounded-full bg-[#DCEFFD]">
            <Text
              numberOfLines={1}
              className="text-[9px] text-[#2563EB]"
              style={{ fontFamily: "Bein" }}
            >
              {medicine.category}
            </Text>
          </View>

          {/* Dosage */}
          <Text
            numberOfLines={1}
            className="shrink-0 text-[9px] text-[#5C6B7A]"
            style={{ fontFamily: "Bein" }}
          >
            {medicine.dosage}
          </Text>
        </View>
      </View>

      {/* Icon or Image Placeholder */}
      <View className="w-[78px] h-[78px] rounded-[18px] overflow-hidden bg-white border border-[#EBF5F4] items-center justify-center">
        {medicine.image ? (
          <Image
            source={{ uri: medicine.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-[#EAF5F4] items-center justify-center">
            <Pill size={22} color="#2B9C8E" />
          </View>
        )}
      </View>
    </Pressable>
  );
};

// ═══════════════════════════════════════════════════════════
//  Screen
// ═══════════════════════════════════════════════════════════

export default function MedicinesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // debounce map: one timer per medicine id
  const debounceMap = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // track which ids are pending locally
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const categories = [ALL_CATEGORY, ...DRUGCATEGORIES].reverse();

  const { data: medicines = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["medicines"],
    queryFn: medicineService.fetchMedicines,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRefreshRef = useRef(0);
  const onRefresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshRef.current < 1500) return;
    lastRefreshRef.current = now;

    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const filteredMedicines = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return medicines.filter((m) => {
      const matchesCategory =
        activeCategory === ALL_CATEGORY || m.category === activeCategory;
      const matchesSearch =
        !query ||
        m.nameAr.toLowerCase().includes(query) ||
        m.nameEn.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory, medicines]);

  const queryClient = useQueryClient();

  const { data: favoriteIdsList = [] } = useQuery({
    queryKey: ["favorites", "Medicine"],
    queryFn: () => favoriteService.getFavorites("Medicine"),
  });

  const favoriteIds = useMemo(() => new Set(favoriteIdsList), [favoriteIdsList]);

  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: string) => favoriteService.toggleFavorite(id, "Medicine"),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", "Medicine"] });
      const previousFavorites = queryClient.getQueryData<string[]>(["favorites", "Medicine"]);
      
      queryClient.setQueryData<string[]>(["favorites", "Medicine"], (old = []) => {
        if (old.includes(id)) {
          return old.filter((f) => f !== id);
        } else {
          return [...old, id];
        }
      });
      
      return { previousFavorites };
    },
    onError: (err: any, id, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favorites", "Medicine"], context.previousFavorites);
      }
      // Show AlertBox
      const msg = err?.message || "حدث خطأ أثناء تحديث المفضلة";
      setAlertMsg(msg);
      setTimeout(() => setAlertMsg(null), 3500);
    },
    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: ["favorites", "Medicine"] });
      setPendingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    },
  });

  // Debounced toggle — one request per item after 600ms idle
  const toggleFavorite = useCallback((id: string) => {
    if (pendingIds.has(id)) return;
    if (debounceMap.current[id]) clearTimeout(debounceMap.current[id]);
    debounceMap.current[id] = setTimeout(() => {
      setPendingIds((prev) => new Set(prev).add(id));
      toggleFavoriteMutation.mutate(id);
    }, 600);
  }, [pendingIds, toggleFavoriteMutation]);

  return (
    <View className="flex-1 bg-white">
      <View className="bg-[#2B9C8E] h-[35px] w-full" />

      {/* ══════════ ALERT BOX ══════════ */}
      <AlertBox
        visible={!!alertMsg}
        message={alertMsg ?? ""}
        type="error"
      />

      <FlatList
        data={filteredMedicines}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#2B9C8E"]}
            tintColor="#2B9C8E"
            progressBackgroundColor="#ffffff"
          />
        }
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
        ListHeaderComponent={
          <View>
            {/* ── Search Bar ── */}
            <View className="flex-row items-center bg-[#EAF5F4] rounded-[20px] px-5 h-[56px] mb-5">
              <Pressable hitSlop={8}>
                <Search size={20} color="#2B9C8E" />
              </Pressable>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="بحث عن دوائك عربي/إنجليزي"
                placeholderTextColor="#7FA8A3"
                className="flex-1 text-right text-[15px] text-[#1A2332] mr-3"
                style={{ fontFamily: "Bein" }}
              />
            </View>

            {/* ── Category Filters ── */}
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              horizontal
              inverted
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
              renderItem={({ item }) => {
                const isActive = item === activeCategory;
                return (
                  <Pressable
                    onPress={() => setActiveCategory(item)}
                    className={`px-4 h-[35px] rounded-full items-center justify-center border ${
                      isActive
                        ? "bg-[#2B9C8E] border-[#2B9C8E]"
                        : "bg-white border-[#2B9C8E]"
                    }`}
                  >
                    <Text
                      className={`text-[13px] ${
                        isActive ? "text-white" : "text-[#2B9C8E]"
                      }`}
                      style={{ fontFamily: "Bein-Black" }}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
              style={{ marginBottom: 20 }}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#2B9C8E" />
            </View>
          ) : isError ? (
            <View className="items-center justify-center py-20">
              <Text className="text-[14px] text-red-500" style={{ fontFamily: "Bein" }}>
                حدث خطأ أثناء جلب الأدوية
              </Text>
            </View>
          ) : (
            <View className="items-center justify-center py-20">
              <Text className="text-[14px] text-[#8A9AA9]" style={{ fontFamily: "Bein" }}>
                لا توجد نتائج مطابقة لبحثك
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <MedicineRow
            medicine={item}
            isFavorite={favoriteIds.has(item.id)}
            isFavPending={pendingIds.has(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onPress={() => router.push(`/medicines/${item.id}`)}
          />
        )}
      />
    </View>
  );
}