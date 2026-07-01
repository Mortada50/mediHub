import React, { useState, useCallback, useRef, useMemo } from "react";
import {
    View,
    Text,
    Pressable,
    FlatList,
    Image,
    ActivityIndicator,
    Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { medicineService } from "../../../services/medicine.service";
import * as Location from "expo-location";
import axios from "axios";
import {
    ChevronRight,
    Map,
    List,
    MapPin,
    Clock,
    DollarSign,
    MessageCircle,
    Navigation,
} from "lucide-react-native";

// ═══════════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════════

type PharmacyResult = {
    id: string;
    name: string;
    price: number;
    currency: string;
    isOpen: boolean;
    closingTime?: string;
    address: string;
    distanceKm: number;
    image?: string;
    location?: { type: string, coordinates: number[] };
    phone?: string;
    rating?: { average: number, count: number };
};

type SortFilter = "الكل" | "قريب مني" | "الاقل سعراً" | "مفتوح الان";

const FILTERS: SortFilter[] = ["مفتوح الان", "الاقل سعراً", "قريب مني", "الكل"];

// ═══════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════

const formatClosingTimeText = (timeStr?: string) => {
    if (!timeStr || timeStr === "23:59" || timeStr === "24:00" || timeStr === "00:00") {
        return "مفتوح"; // 24 hours
    }

    const parts = timeStr.split(":");
    if (parts.length < 2) return `مفتوح حتى ${timeStr}`;

    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? "م" : "ص";

    h = h % 12;
    h = h ? h : 12;

    return `مفتوح حتى ${h}:${m} ${ampm}`;
};

// ═══════════════════════════════════════════════════════════
//  Filter Pill
// ═══════════════════════════════════════════════════════════

const FilterPill = ({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        className={`px-[18px] py-[8px] rounded-full border ${isActive
            ? "bg-[#2B9C8E] border-[#2B9C8E]"
            : "bg-white border-[#EBF5F4]"
            }`}
    >
        <Text
            className={`text-[13px] ${isActive ? "text-white" : "text-[#7A8A9A]"
                }`}
            style={{ fontFamily: "Bein" }}
        >
            {label}
        </Text>
    </Pressable>
);

// ═══════════════════════════════════════════════════════════
//  Main Pharmacy Card (list view)
// ═══════════════════════════════════════════════════════════

const PharmacyListCard = ({
    pharmacy,
    onInquire,
    onTrackOnMap,
    showMapButton,
    activeFilter,
}: {
    pharmacy: PharmacyResult;
    onInquire: () => void;
    onTrackOnMap: () => void;
    showMapButton: boolean;
    activeFilter: SortFilter;
}) => {
    return (
        <View
            className="bg-[#F4FAFA] rounded-[24px] p-4 mb-4 border border-[#F0F4F4]"
            style={{
                shadowColor: "#2B9C8E",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 12,
                elevation: 3,
            }}
        >
            <View className="flex-row gap-4 bg-[#F4FAFA]">
                {/* ── IMAGE ── */}
                <View className="w-[84px] h-[84px] rounded-[18px] overflow-hidden bg-background border border-[#D0EDEA]">
                    <Image
                        source={{ uri: pharmacy.image || "https://images.unsplash.com/photo-1631549916768-4119b2e5f926" }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    {!pharmacy.isOpen && (
                        <View className="absolute inset-0 bg-background/60 items-center justify-center">
                            <Text
                                className="text-[11px] text-[#DC2626] bg-white px-2 py-0.5 rounded-full"
                                style={{ fontFamily: "Bein-Black" }}
                            >
                                مغلق
                            </Text>
                        </View>
                    )}
                </View>

                {/* ── INFO ── */}
                <View className="flex-1 justify-between py-1">
                    <View className="items-start">
                        <Text
                            className="text-[16px] text-gray-700 leading-5 mb-1"
                            style={{ fontFamily: "Bein-Black" }}
                        >
                            {pharmacy.name}
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <MapPin size={12} color="#7A8A9A" />
                            <Text
                                className="text-[12px] text-[#7A8A9A]"
                                style={{ fontFamily: "Bein" }}
                            >
                                {pharmacy.address}
                            </Text>
                        </View>
                    </View>

                    {/* Meta stats */}
                    <View className="flex-row-reverse items-center justify-between mt-3 p-2 rounded-[12px] border border-[#D0EDEA]">
                        <View className="flex-row-reverse items-center gap-1.5">
                            <Text
                                className="text-[11px] text-[#7A8A9A]"
                                style={{ fontFamily: "Bein" }}
                            >
                                {pharmacy.isOpen ? (
                                    <Text style={{ fontFamily: "Bein" }}>{formatClosingTimeText(pharmacy.closingTime)}</Text>
                                ) : "مغلق الان"}
                            </Text>
                            <Clock size={13} color="#2B9C8E" />
                        </View>
                        <View className="w-[1px] h-3 bg-[#D0EDEA]" />
                        {activeFilter === "قريب مني" ? (
                            <View className="flex-row-reverse items-center gap-1.5">
                                <Text
                                    className="text-[11px] text-[#7A8A9A]"
                                    style={{ fontFamily: "Bein" }}
                                >
                                    ~{pharmacy.distanceKm}كم
                                </Text>
                                <MapPin size={13} color="#2B9C8E" />
                            </View>
                        ) : (
                            <View className="flex-row-reverse items-center gap-1.5">
                                <Text
                                    className="text-[11px] text-[#7A8A9A]"
                                    style={{ fontFamily: "Bein" }}
                                >
                                    <Text className="text-[11px]">{pharmacy.price} ريال</Text>
                                </Text>
                                <DollarSign size={13} color="#2B9C8E" />
                            </View>
                        )}

                    </View>
                </View>
            </View>

            {/* Price Highlight */}
            {activeFilter === "الاقل سعراً" && (
                <View className="mt-3 flex-row items-center justify-between bg-[#F4FAFA] rounded-[14px] p-3 border border-[#2B9C8E]/20">
                    <Text
                        className="text-[12px] text-[#2B9C8E]"
                        style={{ fontFamily: "Bein-Black" }}
                    >
                        سعر الدواء:
                    </Text>
                    <View className="flex-row-reverse items-center gap-1">
                        <Text
                            className="text-[12px] text-[#2B9C8E]"
                            style={{ fontFamily: "Bein" }}
                        >
                            {pharmacy.currency}
                        </Text>
                        <Text
                            className="text-[18px] text-[#2B9C8E]"
                            style={{ fontFamily: "Bein-Black", lineHeight: 22 }}
                        >
                            {pharmacy.price}
                        </Text>
                        <View className="bg-[#2B9C8E]/10 p-1 rounded-full ml-1">
                            <DollarSign size={14} color="#2B9C8E" />
                        </View>
                    </View>
                </View>
            )}

            {/* ── ACTIONS ── */}
            <View className="flex-row-reverse items-center gap-2 mt-4">
                <Pressable
                    onPress={onInquire}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                    className="flex-1 bg-[#2B9C8E] h-[44px] rounded-[14px] flex-row-reverse items-center justify-center gap-2"
                >
                    <Text
                        className="text-white text-[13px]"
                        style={{ fontFamily: "Bein-Black" }}
                    >
                        استفسار عن الدواء
                    </Text>
                    <MessageCircle size={16} color="white" />
                </Pressable>

                {showMapButton && activeFilter === "قريب مني" && (
                    <Pressable
                        onPress={onTrackOnMap}
                        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                        className="bg-[#EAF5F4] h-[44px] px-5 rounded-[14px] flex-row-reverse items-center justify-center gap-2 border border-[#2B9C8E]/20"
                    >
                        <Text
                            className="text-[#2B9C8E] text-[13px]"
                            style={{ fontFamily: "Bein-Black" }}
                        >
                            تتبع على الخريطة
                        </Text>
                        <Map size={16} color="#2B9C8E" />
                    </Pressable>
                )}
            </View>
        </View>
    );
};

// ═══════════════════════════════════════════════════════════
//  Simple Pharmacy Row (compact, map view list)
// ═══════════════════════════════════════════════════════════

const PharmacySimpleRow = ({ pharmacy, isSelected = false }: { pharmacy: PharmacyResult; isSelected?: boolean }) => (
    <View className={`flex-row items-center px-5 py-4 border-b border-[#F0F4F4] gap-2 ${isSelected ? "bg-[#EAF5F4]" : "bg-white"}`}>
        {/* Avatar */}
        <View className="w-[48px] h-[48px] rounded-[14px] overflow-hidden bg-[#EAF5F4] items-center justify-center border border-[#D0EDEA]">
            <Image
                source={{ uri: pharmacy.image || "https://images.unsplash.com/photo-1631549916768-4119b2e5f926" }}
                className="w-full h-full"
                resizeMode="cover"
            />
        </View>

        {/* Info */}
        <View className="flex-1 items-start ml-3">
            <Text
                className="text-[14px] text-gray-600"
                style={{ fontFamily: "Bein-Black" }}
            >
                {pharmacy.name}
            </Text>
            <View className="flex-row-reverse items-center gap-1 mt-1">
                <Text
                    className="text-[11px] text-[#9AAAB4]"
                    style={{ fontFamily: "Bein" }}
                >
                    {pharmacy.distanceKm}كم
                </Text>
                <MapPin size={11} color="#2B9C8E" />
            </View>
        </View>

        {/* Status */}
        <View
            className={`px-[10px] py-0.5 rounded-full ${pharmacy.isOpen ? "bg-[#D1FAE5]" : "bg-[#FEE2E2]"
                }`}
        >
            <Text
                className={`text-[10px] ${pharmacy.isOpen ? "text-[#059669]" : "text-[#DC2626]"
                    }`}
                style={{ fontFamily: "Bein" }}
            >
                {pharmacy.isOpen ? "مفتوح الان" : "مغلق الان"}
            </Text>
        </View>
    </View>
);

// ═══════════════════════════════════════════════════════════
//  Leaflet Multi-Pharmacy Map HTML
// ═══════════════════════════════════════════════════════════
function buildAllPharmaciesMapHtml(
    userLat: number | null,
    userLng: number | null,
    pharmacies: any[],
    selectedId: string | null,
    routeCoords: number[][]
): string {

    const pharmData = pharmacies
        .filter(p => p.location?.coordinates?.length === 2)
        .map(p => ({
            id: p.id,
            name: p.name,
            lat: p.location.coordinates[1],
            lng: p.location.coordinates[0],
            isSelected: p.id === selectedId,
        }));

    const routeLatLngs = routeCoords.map(c => [c[1], c[0]]);

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body,#map{height:100%;width:100%}</style>
</head>
<body>
<div id="map"></div>

<script>
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

var PHARMS = ${JSON.stringify(pharmData)};
var ROUTE  = ${JSON.stringify(routeLatLngs)};
var USER_LAT = ${userLat ?? 'null'};
var USER_LNG = ${userLng ?? 'null'};
var SELECTED_ID = ${JSON.stringify(selectedId)};

var map = L.map('map', { zoomControl: true, attributionControl: false });
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

if (USER_LAT !== null) {
  var userDiv = document.createElement('div');
  userDiv.style.cssText = 'width:32px;height:32px;background:#EF4444;border-radius:50%;border:3px solid white;box-shadow:0 3px 8px rgba(239,68,68,0.5);display:flex;align-items:center;justify-content:center;';
  userDiv.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>';
  var userIcon = L.divIcon({ className: '', html: userDiv.outerHTML, iconSize: [32,32], iconAnchor: [16,16] });
  L.marker([USER_LAT, USER_LNG], { icon: userIcon }).addTo(map);
}

if (ROUTE.length > 0) {
  L.polyline(ROUTE, { color: '#3B82F6', weight: 5, opacity: 0.85, lineJoin: 'round', lineCap: 'round' }).addTo(map);
}

var allLatLngs = USER_LAT !== null ? [[USER_LAT, USER_LNG]] : [];

PHARMS.forEach(function(p) {
  var isSelected = p.id === SELECTED_ID;
  var bg = isSelected ? '#2B9C8E' : '#64B5AE';
  var size = isSelected ? 46 : 36;

  var pinDiv = document.createElement('div');
  pinDiv.style.cssText =
    'width:'+size+'px;height:'+size+'px;background:'+bg+';border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px '+bg+'70;display:flex;align-items:center;justify-content:center;';

  pinDiv.innerHTML =
    '<svg style="transform:rotate(45deg)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';

  var icon = L.divIcon({
    className: '',
    html: pinDiv.outerHTML,
    iconSize: [size,size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -(size+4)]
  });

  var marker = L.marker([p.lat, p.lng], { icon: icon }).addTo(map);

 
  marker.bindPopup(
    '<b style="font-family:sans-serif;font-size:13px">' +
    escapeHtml(p.name) +
    '</b>'
  );


  marker.on('click', function() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: "PHARMACY_SELECT",
        id: String(p.id)
      }));
    }
  });

  if (isSelected) marker.openPopup();
  allLatLngs.push([p.lat, p.lng]);
});

if (allLatLngs.length > 1) {
  map.fitBounds(allLatLngs, { padding: [40, 40] });
} else if (allLatLngs.length === 1) {
  map.setView(allLatLngs[0], 14);
} else {
  map.setView([15.5, 44.2], 7);
}
</script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════
//  Screen
// ═══════════════════════════════════════════════════════════

type ViewMode = "list" | "map";

export default function MedicineSearchResultsScreen() {
    const insets = useSafeAreaInsets();
    const rawParams = useLocalSearchParams<{ id: string; name: string }>();

    const medicineId = Array.isArray(rawParams.id) ? rawParams.id[0] : rawParams.id;
    const name = Array.isArray(rawParams.name) ? rawParams.name[0] : rawParams.name;

    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [activeFilter, setActiveFilter] = useState<SortFilter>("الكل");
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const { data: pharmacies = [], isLoading } = useQuery({
        queryKey: ["pharmaciesForMedicine", medicineId, userLocation?.lat, userLocation?.lng],
        queryFn: () => medicineService.fetchPharmaciesWithMedicine(medicineId!, userLocation?.lat, userLocation?.lng),
        enabled: !!medicineId && medicineId.length === 24,
    });

    const count = pharmacies.length;
    const medicineName = name ?? "الدواء";

    const filteredPharmacies = useCallback(() => {
        let list = [...pharmacies];
        if (activeFilter === "قريب مني") {
            list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
        } else if (activeFilter === "الاقل سعراً") {
            list.sort((a, b) => a.price - b.price);
        } else if (activeFilter === "مفتوح الان") {
            list = list.filter((p) => p.isOpen);
        }
        return list;
    }, [pharmacies, activeFilter])();

    const requestUserLocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return null;
            const loc = await Location.getCurrentPositionAsync({});
            const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
            setUserLocation(coords);
            return coords;
        } catch {
            return null;
        }
    }, []);

    const handleFilterChange = async (filter: SortFilter) => {

        if (filter === "قريب مني" && !userLocation) {
            const loc = await requestUserLocation();
            if (!loc) return;
        }
        setActiveFilter(filter);
    };

    const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);
    const [routeCoords, setRouteCoords] = useState<number[][]>([]);
    const [routeDistance, setRouteDistance] = useState<string>("");
    const [routeDuration, setRouteDuration] = useState<string>("");
    const [fetchingRoute, setFetchingRoute] = useState(false);
    const mapListRef = useRef<FlatList>(null);

    const selectedPharmacy = useMemo(
        () => pharmacies.find(p => p.id === selectedPharmacyId) ?? null,
        [pharmacies, selectedPharmacyId]
    );

    const fetchRoute = useCallback(async (pharmacy: any, locOverride?: { lat: number; lng: number }) => {
        const loc = locOverride ?? userLocation;
        if (!loc || !pharmacy?.location?.coordinates) return;
        setFetchingRoute(true);
        setRouteCoords([]);
        try {
            const [pharmLng, pharmLat] = pharmacy.location.coordinates;
            const resp = await axios.get(
                `http://router.project-osrm.org/route/v1/driving/${loc.lng},${loc.lat};${pharmLng},${pharmLat}?overview=full&geometries=geojson`,
                { timeout: 10000 }
            );
            const route = resp.data?.routes?.[0];
            if (route) {
                setRouteCoords(route.geometry.coordinates);
                setRouteDistance(`${(route.distance / 1000).toFixed(1)} كم`);
                setRouteDuration(`${Math.ceil(route.duration / 60)} دقيقة`);
            }
        } catch {
            setRouteCoords([]);
        } finally {
            setFetchingRoute(false);
        }
    }, [userLocation]);

    const handlePharmacySelect = useCallback((id: string, locOverride?: { lat: number; lng: number }) => {
        setSelectedPharmacyId(id);
        setRouteDistance("");
        setRouteDuration("");
        const pharm = pharmacies.find(p => p.id === id);
        if (pharm) fetchRoute(pharm, locOverride);
        const idx = pharmacies.findIndex(p => p.id === id);
        if (idx >= 0) mapListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0 });
    }, [pharmacies, fetchRoute]);

    const mapHtml = useMemo(() => buildAllPharmaciesMapHtml(
        userLocation?.lat ?? null,
        userLocation?.lng ?? null,
        pharmacies,
        selectedPharmacyId,
        routeCoords
    ), [userLocation, pharmacies, selectedPharmacyId, routeCoords]);

    return (
        <View className="flex-1 bg-white">
            {/* ══════════ TEAL STATUS BAR FILL ══════════ */}
            <View
                className="bg-[#2B9C8E] absolute top-0 left-0 right-0"
                style={{ height: insets.top }}
            />

            {/* ══════════ HEADER ══════════ */}
            <View
                className="bg-background-primary px-5 pb-3 rounded-b-[28px]"
                style={{ paddingTop: insets.top + 14 }}
            >
                {/* Back + title row */}
                <View className="flex-row-reverse items-center justify-between mb-[14px] gap-3">
                    {/* Medicine name (right, RTL) */}
                    <View className="flex-1 items-start">
                        <Text
                            className="text-[20px] text-gray-600"
                            style={{
                                fontFamily: "Bein-Black",
                                lineHeight: 25,
                            }}
                        >
                            {medicineName}
                        </Text>

                        <Text
                            className="text-[12px] text-[#7A8A9A]"
                            style={{
                                fontFamily: "Bein",
                                lineHeight: 15,
                            }}
                            numberOfLines={1}
                        >
                            {count} صيدليات يتوفر فيها هذا الدواء
                        </Text>
                    </View>

                    {/* Back button (left, RTL) */}
                    <Pressable
                        onPress={() => router.back()}
                        hitSlop={10}
                        style={({ pressed }) => ({
                            opacity: pressed ? 0.6 : 1,
                            marginLeft: 12,
                        })}
                        className="w-[38px] h-[38px] rounded-full bg-[#F3FAFA] items-center justify-center"
                    >
                        <ChevronRight size={30} color="#2B9C8E" />
                    </Pressable>
                </View>

                {/* View mode toggle */}
                <View className="flex-row items-start gap-3">
                    {/* List toggle */}
                    <Pressable
                        onPress={() => setViewMode("list")}
                        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                        className={`flex-row-reverse items-center gap-2 px-5 h-[38px] rounded-full border ${viewMode === "list"
                            ? "bg-[#2B9C8E] border-[#2B9C8E]"
                            : "bg-white border-[#2B9C8E]"
                            }`}
                    >
                        <Text
                            className={`text-[13px] ${viewMode === "list" ? "text-white" : "text-[#2B9C8E]"
                                }`}
                            style={{ fontFamily: "Bein-Black" }}
                        >
                            قائمة
                        </Text>
                        <List size={15} color={viewMode === "list" ? "#fff" : "#2B9C8E"} />
                    </Pressable>
                    {/* Map toggle */}
                    <Pressable
                        onPress={async () => {
                            setViewMode("map");
                            if (!userLocation) await requestUserLocation();
                        }}
                        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                        className={`flex-row-reverse items-center gap-2 px-5 h-[38px] rounded-full border ${viewMode === "map"
                            ? "bg-[#2B9C8E] border-[#2B9C8E]"
                            : "bg-white border-[#2B9C8E]"
                            }`}
                    >
                        <Text
                            className={`text-[13px] ${viewMode === "map" ? "text-white" : "text-[#2B9C8E]"
                                }`}
                            style={{ fontFamily: "Bein-Black" }}
                        >
                            خريطة
                        </Text>
                        <Map size={15} color={viewMode === "map" ? "#fff" : "#2B9C8E"} />
                    </Pressable>
                </View>
            </View>

            {/* ══════════ BODY ══════════ */}

            {viewMode === "map" ? (
                /* ── Map View ── */
                <View className="flex-1">
                    {/* Leaflet WebView */}
                    <WebView
                        originWhitelist={["*"]}
                        source={{ html: mapHtml, baseUrl: "https://leafletjs.com" }}
                        style={{ flex: 1 }}
                        javaScriptEnabled
                        domStorageEnabled
                        onMessage={(e) => handlePharmacySelect(e.nativeEvent.data)}
                        startInLoadingState
                        renderLoading={() => (
                            <View className="absolute inset-0 items-center justify-center bg-[#EAF5F4]">
                                <ActivityIndicator size="large" color="#2B9C8E" />
                            </View>
                        )}
                    />

                    {/* Bottom sheet */}
                    <View
                        className="bg-white rounded-t-[28px] border-t border-[#EBF5F4]"
                        style={{
                            elevation: 12,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: -4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            maxHeight: 340,
                        }}
                    >
                        {/* Handle */}
                        <View className="items-center pt-3 pb-1">
                            <View className="w-10 h-1 bg-[#D0EDEA] rounded-full" />
                        </View>

                        {/* Selected pharmacy route info */}
                        {selectedPharmacy && (
                            <View className="px-4 pt-2 pb-3 border-b border-[#EBF5F4]">
                                <Text className="text-[14px] text-gray-600 mb-2" style={{ fontFamily: "Bein-Black" }} numberOfLines={1}>
                                    {selectedPharmacy.name}
                                </Text>
                                <View className="flex-row-reverse gap-3">
                                    {/* Duration */}
                                    <View className="flex-1 bg-[#EAF5F4] rounded-[12px] px-3 py-2 items-center">
                                        <Text className="text-[10px] text-[#7A8A9A]" style={{ fontFamily: "Bein" }}>وقت القيادة</Text>
                                        <Text className="text-[17px] text-[#2B9C8E]" style={{ fontFamily: "Bein-Black" }}>
                                            {fetchingRoute ? "..." : routeDuration || "—"}
                                        </Text>
                                        {!fetchingRoute && routeDuration ? (
                                            <Text className="text-[9px] text-[#B0BEC5]" style={{ fontFamily: "Bein" }}>بدون ازدحام</Text>
                                        ) : null}
                                    </View>
                                    {/* Distance */}
                                    <View className="flex-1 bg-[#EAF5F4] rounded-[12px] px-3 py-2 items-center">
                                        <Text className="text-[10px] text-[#7A8A9A]" style={{ fontFamily: "Bein" }}>مسافة الطريق</Text>
                                        <Text className="text-[17px] text-[#2B9C8E]" style={{ fontFamily: "Bein-Black" }}>
                                            {fetchingRoute ? "..." : routeDistance || "—"}
                                        </Text>
                                        {!fetchingRoute && routeDistance ? (
                                            <Text className="text-[9px] text-[#B0BEC5]" style={{ fontFamily: "Bein" }}>مسافة فعلية</Text>
                                        ) : null}
                                    </View>
                                    {/* Google Maps */}
                                    {selectedPharmacy.location?.coordinates && (
                                        <Pressable
                                            className="flex-1 bg-[#2B9C8E] rounded-[12px] px-2 py-2 items-center justify-center gap-1"
                                            onPress={() => Linking.openURL(
                                                `https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.location.coordinates[1]},${selectedPharmacy.location.coordinates[0]}&travelmode=driving`
                                            )}
                                        >
                                            <Navigation size={16} color="white" />
                                            <Text className="text-[10px] text-white" style={{ fontFamily: "Bein-Black" }}>خرائط جوجل</Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Pharmacy list */}
                        <FlatList
                            ref={mapListRef}
                            data={pharmacies}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: insets.bottom + 12 }}
                            onScrollToIndexFailed={() => { }}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => handlePharmacySelect(item.id)}
                                    style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                                >
                                    <PharmacySimpleRow
                                        pharmacy={item}
                                        isSelected={item.id === selectedPharmacyId}
                                    />
                                </Pressable>
                            )}
                        />
                    </View>
                </View>
            ) : (
                /* ── List View ── */
                <FlatList
                    data={filteredPharmacies}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 18,
                        paddingBottom: insets.bottom + 24,
                        paddingTop: 14,
                    }}
                    ListHeaderComponent={
                        /* Filter pills */
                        <FlatList
                            data={FILTERS}
                            keyExtractor={(f) => f}
                            horizontal
                            inverted
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 10, paddingBottom: 14 }}
                            renderItem={({ item }) => (
                                <FilterPill
                                    label={item}
                                    isActive={activeFilter === item}
                                    onPress={() => handleFilterChange(item)}
                                />
                            )}
                        />
                    }
                    ListEmptyComponent={
                        isLoading ? (
                            <View className="items-center justify-center py-24">
                                <ActivityIndicator size="large" color="#2B9C8E" />
                            </View>
                        ) : (
                            <View className="items-center justify-center py-24 gap-3">
                                <View className="w-16 h-16 rounded-full bg-[#EAF5F4] items-center justify-center">
                                    <MapPin size={28} color="#2B9C8E" />
                                </View>
                                <Text
                                    className="text-[14px] text-[#7A8A9A] text-center"
                                    style={{ fontFamily: "Bein" }}
                                >
                                    لا توجد صيدليات تطابق الفلتر المحدد
                                </Text>
                            </View>
                        )
                    }
                    renderItem={({ item }) => (
                        <PharmacyListCard
                            pharmacy={item}
                            showMapButton={true}
                            onInquire={() => {
                                if (item.phone) {
                                    Linking.openURL(`tel:${item.phone}`);
                                }
                            }}
                            onTrackOnMap={() => {
                                router.push(`/(patient)/medicines/track-pharmacy?pharmacy=${encodeURIComponent(JSON.stringify(item))}&userLocation=${encodeURIComponent(JSON.stringify(userLocation))}`);
                            }}
                            activeFilter={activeFilter}
                        />
                    )}
                />
            )}
            <View className="bg-whie w-full h-14" />
        </View>
    );
}