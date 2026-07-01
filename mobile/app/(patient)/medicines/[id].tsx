

import React, { useRef, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Image,
    FlatList,
    Dimensions,
    Animated,
    ActivityIndicator,
    ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ChevronRight,
    Heart,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    MapPin,
    Pill,
} from "lucide-react-native";
import { favoriteService } from "../../../services/favorite.service";
import { medicineService } from "../../../services/medicine.service";
import { AlertBox } from "../../../components/AlertBox";

// ═══════════════════════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════════════════════

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ═══════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════

const formatAgeGroup = (ag?: any): string | null => {
    if (!ag) return null;
    if (ag.type === "جميع الأعمار") return "جميع الأعمار";
    if (ag.type === "حد أدنى" && ag.minAge !== undefined)
        return `+${ag.minAge}سنوات`;
    if (ag.type === "نطاق" && ag.minAge !== undefined && ag.maxAge !== undefined)
        return `${ag.minAge}–${ag.maxAge} سنة`;
    return null;
};

// ═══════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════

// ── Animated Dot ──────────────────────────────────────────
const PaginationDot = ({ isActive }: { isActive: boolean }) => {
    const anim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

    React.useEffect(() => {
        Animated.timing(anim, {
            toValue: isActive ? 1 : 0,
            duration: 280,
            useNativeDriver: false,
        }).start();
    }, [isActive]);

    const width = anim.interpolate({ inputRange: [0, 1], outputRange: [7, 22] });
    const backgroundColor = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#C5DDD9", "#2B9C8E"],
    });

    return (
        <Animated.View
            style={{ width, backgroundColor, height: 7, borderRadius: 4 }}
        />
    );
};

// ── Image Carousel ────────────────────────────────────────
const ImageCarousel = ({ images }: { images: string[] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    if (images.length === 0) {
        return (
            <View className="w-full h-[260px] items-center justify-center bg-white px-8 py-2 mb-4">
                <View className="w-20 h-20 rounded-full bg-[`#EAF5F4`] items-center justify-center">
                    <Pill size={34} color="`#2B9C8E`" />
                </View>
            </View>
        );
    }

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setActiveIndex(viewableItems[0].index);
            }
        }
    ).current;

    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50,
    }).current;

    if (images.length === 1) {
        return (
            <View className="w-full h-[260px] items-center justify-center bg-white px-8 py-2 mb-4">
                <Image
                    source={{ uri: images[0] }}
                    className="w-full h-full"
                    resizeMode="contain"
                />
            </View>
        );
    }

    return (
        <View className="bg-white pb-2">
            <FlatList
                ref={flatListRef}
                data={images}
                keyExtractor={(_, i) => `img-${i}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={SCREEN_WIDTH}
                decelerationRate="fast"
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item }) => (
                    <View
                        className="items-center justify-center bg-white px-8"
                        style={{ width: SCREEN_WIDTH, height: 260 }}
                    >
                        <Image
                            source={{ uri: item }}
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                    </View>
                )}
            />
            {/* Pagination dots */}
            <View className="flex-row justify-center items-center gap-[6px] py-4">
                {images.map((_, i) => (
                    <PaginationDot key={i} isActive={i === activeIndex} />
                ))}
            </View>
        </View>
    );
};

// ── Info Chip ─────────────────────────────────────────────
const InfoChip = ({ label, value }: { label: string; value: string }) => (
    <View className="bg-[#2B9C8E] rounded-[16px] px-4 py-[10px] items-center min-w-[80px]">
        <Text
            className="text-white/75 text-[10px] mt-0.5"
            style={{ fontFamily: "Bein" }}
        >
            {label}
        </Text>
        <Text
            className="text-white text-[13px]"
            style={{ fontFamily: "Bein-Black" }}
        >
            {value}
        </Text>

    </View>
);

// ── Tag Badge ─────────────────────────────────────────────
const TagBadge = ({
    label,
    variant = "default",
}: {
    label: string;
    variant?: "default" | "blue" | "red";
}) => {
    const bgClass =
        variant === "blue"
            ? "bg-[#DCEFFD]"
            : variant === "red"
                ? "bg-[#FEE2E2]"
                : "bg-[#E7ECEF]";
    const textClass =
        variant === "blue"
            ? "text-[#2563EB]"
            : variant === "red"
                ? "text-[#DC2626]"
                : "text-[#5C6B7A]";

    return (
        <View className={`px-3 py-0.5 rounded-full ${bgClass}`}>
            <Text
                className={`text-[11px] ${textClass}`}
                style={{ fontFamily: "Bein" }}
            >
                {label}
            </Text>
        </View>
    );
};

// ── Warning Banner ────────────────────────────────────────
const WarningBanner = ({ text }: { text: string }) => (
    <View className="bg-[#FFFBEA] rounded-[14px] border border-[#FDE68A] px-4 py-[14px] mb-4 items-start">
        <View className="flex-row items-center gap-[6px] mb-[6px]">
            <AlertTriangle size={16} color="#B45309" />
            <Text
                className="text-[13px] text-[#B45309]"
                style={{ fontFamily: "Bein-Black" }}
            >
                تحذيرات
            </Text>
        </View>
        <Text
            className="text-[13px] text-[#92400E] text-right leading-[20px]"
            style={{ fontFamily: "Bein" }}
        >
            {text}
        </Text>
    </View>
);

// ── Expandable Section ────────────────────────────────────
const ExpandableSection = ({
    title,
    content,
    defaultOpen = false,
}: {
    title: string;
    content: string;
    defaultOpen?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <View>
            <Pressable
                onPress={() => setIsOpen((p) => !p)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                className="flex-row-reverse items-center justify-between py-[14px]"
            >
                <View className="w-7 items-center">
                    {isOpen ? (
                        <ChevronUp size={20} color="#2B9C8E" />
                    ) : (
                        <ChevronDown size={20} color="#888" />
                    )}
                </View>
                <Text
                    className="flex-1 text-[16px] text-gray-600"
                    style={{ fontFamily: "Bein-Black" }}
                >
                    {title}
                </Text>
            </Pressable>

            {isOpen && (
                <View className="pb-3 pr-1">
                    <Text
                        className="text-[13px] text-[#4B5C6B] leading-[22px]"
                        style={{ fontFamily: "Bein" }}
                    >
                        {content}
                    </Text>
                </View>
            )}

            <View className="h-px bg-[#D4EAE8]" />
        </View>
    );
};

// ═══════════════════════════════════════════════════════════
//  Screen
// ═══════════════════════════════════════════════════════════

export default function MedicineScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const queryClient = useQueryClient();

    // ── Alert state ──
    const [alertMsg, setAlertMsg] = useState<string | null>(null);

    // ── Debounce ref ──
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Fetch detail ──
    const { data: medicine, isLoading, isError } = useQuery({
        queryKey: ["medicine", id],
        queryFn: () => medicineService.fetchMedicineById(id ?? ""),
        enabled: !!id,
    });

    // ── Favorites ──
    const { data: favoriteIdsList = [] } = useQuery({
        queryKey: ["favorites", "Medicine"],
        queryFn: () => favoriteService.getFavorites("Medicine"),
    });

    const isFavorite = favoriteIdsList.includes(medicine?.id ?? "");

    const toggleFavoriteMutation = useMutation({
        mutationFn: (medId: string) =>
            favoriteService.toggleFavorite(medId, "Medicine"),
        onMutate: async (medId) => {
            await queryClient.cancelQueries({ queryKey: ["favorites", "Medicine"] });
            const prev = queryClient.getQueryData<string[]>(["favorites", "Medicine"]);
            queryClient.setQueryData<string[]>(
                ["favorites", "Medicine"],
                (old = []) =>
                    old.includes(medId)
                        ? old.filter((f) => f !== medId)
                        : [...old, medId]
            );
            return { prev };
        },
        onError: (err: any, _id, ctx) => {
            if (ctx?.prev)
                queryClient.setQueryData(["favorites", "Medicine"], ctx.prev);
            // Show AlertBox with server message
            const msg =
                err?.message || "حدث خطأ أثناء تحديث المفضلة";
            setAlertMsg(msg);
            setTimeout(() => setAlertMsg(null), 3500);
        },
        onSettled: () =>
            queryClient.invalidateQueries({ queryKey: ["favorites", "Medicine"] }),
    });

    // Debounced handler — prevents rapid-fire requests
    const handleToggleFavorite = useCallback(() => {
        if (!medicine || toggleFavoriteMutation.isPending) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            toggleFavoriteMutation.mutate(medicine.id);
        }, 600);
    }, [medicine, toggleFavoriteMutation.isPending]);

    // ── Loading state ──
    if (isLoading) {
        return (
            <View
                className="flex-1 items-center justify-center bg-background"
                style={{ paddingTop: insets.top }}
            >
                <ActivityIndicator size="large" color="#2B9C8E" />
            </View>
        );
    }

    // ── Error state ──
    if (isError || !medicine) {
        return (
            <View
                className="flex-1 items-center justify-center bg-background gap-4 px-8"
                style={{ paddingTop: insets.top }}
            >
                <Text
                    className="text-[14px] text-red-500 text-center"
                    style={{ fontFamily: "Bein" }}
                >
                    تعذّر تحميل تفاصيل الدواء. حاول مرة أخرى.
                </Text>
                <Pressable
                    onPress={() => router.back()}
                    className="bg-primary px-6 py-3 rounded-[14px]"
                >
                    <Text
                        className="text-white text-[14px]"
                        style={{ fontFamily: "Bein-Black" }}
                    >
                        العودة
                    </Text>
                </Pressable>
            </View>
        );
    }

    // ── Derived values ──
    const ageLabel = formatAgeGroup(medicine.ageGroup);

    const infoChips: { label: string; value: string }[] = [
        ...(medicine.manufacturer
            ? [{ label: "المنشئ", value: medicine.manufacturer }]
            : []),
        ...(medicine.countryOfManufacture
            ? [{ label: "البلد المصنع", value: medicine.countryOfManufacture }]
            : []),
        ...(medicine.concentration
            ? [{ label: "التركيز", value: medicine.concentration }]
            : []),
        ...(ageLabel ? [{ label: "الفئة العمرية", value: ageLabel }] : []),
    ];

    return (
        <View className="flex-1 bg-background">

            {/* ══════════ HEADER ══════════ */}
            <View
                className="flex-row items-center justify-between px-5 pb-[10px] bg-background"
                style={{ paddingTop: insets.top + 12 }}
            >
                {/* Back — RTL: right side */}
                <Pressable
                    onPress={() => router.back()}
                    hitSlop={10}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                    className="w-[38px] h-[38px] rounded-full bg-background-primary items-center justify-center"
                >
                    <ChevronRight size={22} color="#2B9C8E" />
                </Pressable>

                <Text
                    className="text-[17px] text-[#1A2332]"
                    style={{ fontFamily: "Bein-Black" }}
                >
                    تفاصيل الدواء
                </Text>

                {/* Favorite — RTL: left side */}
                <Pressable
                    onPress={handleToggleFavorite}
                    disabled={toggleFavoriteMutation.isPending}
                    hitSlop={10}
                    style={({ pressed }) => ({
                        opacity: toggleFavoriteMutation.isPending ? 0.4 : pressed ? 0.6 : 1,
                    })}
                    className="w-[38px] h-[38px] rounded-full bg-background-primary items-center justify-center"
                >
                    <Heart
                        size={22}
                        color="#2B9C8E"
                        fill={isFavorite ? "#2B9C8E" : "transparent"}
                    />
                </Pressable>
            </View>

            {/* ══════════ ALERT BOX ══════════ */}
            <AlertBox
                visible={!!alertMsg}
                message={alertMsg ?? ""}
                type="error"
            />

            {/* ══════════ SCROLL BODY ══════════ */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100, flexGrow: 1 }}
            >
                {/* ── Image Carousel / Single image ── */}
                <ImageCarousel images={medicine.images} />

                {/* ── Content Card ── */}
                <View className="bg-background-primary rounded-t-[32px] px-[22px] pt-7 pb-4 -mt-4 flex-1">

                    {/* Name block */}
                    <View className="items-start mb-3">
                        {medicine.nameAr && (
                            <Text
                                className="text-[30px] text-gray-600 text-right leading-[42px]"
                                style={{ fontFamily: "Bein-Black" }}
                            >
                                {medicine.nameAr}
                            </Text>
                        )}
                        {(medicine.nameEn || medicine.genericName) && (
                            <Text
                                className="text-[14px] text-[#6B7A8A] text-right mt-0.5"
                                style={{ fontFamily: "Bein" }}
                            >
                                {[medicine.nameEn, medicine.genericName]
                                    .filter(Boolean)
                                    .join("-")}
                            </Text>
                        )}
                    </View>

                    {/* Badges */}
                    <View className="flex-row flex-wrap justify-start gap-2 mb-[10px]">
                        <TagBadge
                            label={
                                medicine.requiresPrescription
                                    ? "يتطلب وصفة طبيه"
                                    : "لا يتطلب وصفة طبيه"
                            }
                            variant={medicine.requiresPrescription ? "red" : "default"}
                        />
                        {medicine.category && (
                            <TagBadge label={medicine.category} variant="blue" />
                        )}
                        {medicine.type && <TagBadge label={medicine.type} />}
                    </View>

                    {/* Description */}
                    {medicine.description && (
                        <Text
                            className="text-[14px] text-[#3D4B5C] mb-4 leading-[22px]"
                            style={{ fontFamily: "Bein" }}
                        >
                            {medicine.description}
                        </Text>
                    )}

                    {/* Info Chips */}
                    {infoChips.length > 0 && (
                        <View className="flex-row flex-wrap justify-center gap-[10px] mb-[18px]">
                            {infoChips.map((chip) => (
                                <InfoChip key={chip.label} label={chip.label} value={chip.value} />
                            ))}
                        </View>
                    )}

                    {/* Warnings */}
                    {medicine.warnings && <WarningBanner text={medicine.warnings} />}

                    <View className="h-2" />

                    {/* Expandable sections — rendered only when data exists */}
                    {medicine.sideEffects && (
                        <ExpandableSection
                            title="الآثار الجانبية"
                            content={medicine.sideEffects}
                            defaultOpen={true}
                        />
                    )}
                    {medicine.contraindications && (
                        <ExpandableSection
                            title="موانع الاستخدام"
                            content={medicine.contraindications}
                        />
                    )}
                    {medicine.storageConditions && (
                        <ExpandableSection
                            title="شروط التخزين"
                            content={medicine.storageConditions}
                        />
                    )}
                </View>
            </ScrollView>

            {/* ══════════ BOTTOM CTA ══════════ */}
            <View
                className="absolute bottom-0 left-0 right-0 px-5 pt-10 bg-background-primary"
                style={{ paddingBottom: insets.bottom + 12 }}
            >
                <Pressable
                    style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
                    className="bg-primary rounded-[22px] h-[56px] flex-row items-center justify-center"
                    onPress={() =>
                        router.push(
                            `/medicines/search-results?id=${medicine.id}&name=${encodeURIComponent(medicine.nameAr)}`
                        )
                    }
                >
                    <MapPin size={18} color="#fff" style={{ marginLeft: 8 }} />
                    <Text
                        className="text-white text-[16px]"
                        style={{ fontFamily: "Bein-Black" }}
                    >
                        إين يتوفر هذا الدواء؟
                    </Text>
                </Pressable>
            </View>

        </View>
    );
}