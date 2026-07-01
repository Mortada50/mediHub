import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    Pressable,
    ActivityIndicator,
    ScrollView,
    Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
    ChevronRight,
    MapPin,
    Clock,
    Navigation,
    Star,
    Phone,
    AlertCircle,
    Car,
    CarFront,
} from "lucide-react-native";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type LatLng = { latitude: number; longitude: number };

// ─────────────────────────────────────────────────────────────────────────────
// Leaflet HTML template
// ─────────────────────────────────────────────────────────────────────────────
function buildLeafletHtml(
    userLat: number,
    userLng: number,
    pharmLat: number,
    pharmLng: number,
    routeGeoJson: string, // GeoJSON LineString coordinates array JSON string
    pharmName: string
) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { height: 100%; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: true, attributionControl: false });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // ── User Marker (red pin) ──
    const userIcon = L.divIcon({
      className: '',
      html: \`<div style="
        width:36px;height:36px;
        background:#EF4444;
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 3px 12px rgba(239,68,68,0.5);
        display:flex;align-items:center;justify-content:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
      </div>\`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    // ── Pharmacy Marker (teal pin) ──
    const pharmIcon = L.divIcon({
      className: '',
      html: \`<div style="
        width:44px;height:44px;
        background:#2B9C8E;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 4px 14px rgba(43,156,142,0.5);
        display:flex;align-items:center;justify-content:center;">
        <svg style="transform:rotate(45deg)" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>\`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -48],
    });

    const userMarker = L.marker([${userLat}, ${userLng}], { icon: userIcon })
      .addTo(map)
      .bindPopup('<div style="font-family:sans-serif;font-size:13px;text-align:center;padding:4px;"><b>موقعك الحالي</b></div>');

    const pharmMarker = L.marker([${pharmLat}, ${pharmLng}], { icon: pharmIcon })
      .addTo(map)
      .bindPopup('<div style="font-family:sans-serif;font-size:13px;text-align:center;padding:4px 8px;"><b>${pharmName.replace(/'/g, "\\'")}</b></div>');

    pharmMarker.openPopup();

    // ── Draw route polyline ──
    const coords = ${routeGeoJson};
    if (coords && coords.length > 0) {
      const latlngs = coords.map(c => [c[1], c[0]]);
      L.polyline(latlngs, {
        color: '#3B82F6',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(map);
    }

    // ── Fit bounds to show both markers ──
    const group = new L.featureGroup([userMarker, pharmMarker]);
    map.fitBounds(group.getBounds().pad(0.25));
  </script>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function TrackPharmacyScreen() {
    const insets = useSafeAreaInsets();
    const rawParams = useLocalSearchParams<{ pharmacy: string; userLocation: string }>();

    const pharmacyData = useMemo(() => {
        try { return rawParams.pharmacy ? JSON.parse(rawParams.pharmacy as string) : null; }
        catch { return null; }
    }, [rawParams.pharmacy]);

    const userLocation = useMemo(() => {
        try { return rawParams.userLocation ? JSON.parse(rawParams.userLocation as string) : null; }
        catch { return null; }
    }, [rawParams.userLocation]);

    const [routeCoords, setRouteCoords] = useState<number[][]>([]);
    const [distance, setDistance] = useState<string>("");
    const [duration, setDuration] = useState<string>("");
    const [loadingRoute, setLoadingRoute] = useState(true);
    const [routeError, setRouteError] = useState(false);

    const pharmLat = pharmacyData?.location?.coordinates?.[1];
    const pharmLng = pharmacyData?.location?.coordinates?.[0];
    const userLat = userLocation?.lat;
    const userLng = userLocation?.lng;

    const hasValidData = pharmLat != null && pharmLng != null && userLat != null && userLng != null;

    useEffect(() => {
        if (!hasValidData) {
            setLoadingRoute(false);
            return;
        }

        const fetchRoute = async () => {
            try {
                const resp = await axios.get(
                    `http://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${pharmLng},${pharmLat}?overview=full&geometries=geojson`
                );
                if (resp.data?.routes?.length > 0) {
                    const route = resp.data.routes[0];
                    setRouteCoords(route.geometry.coordinates);
                    setDistance(`${(route.distance / 1000).toFixed(1)} كم`);
                    setDuration(`${Math.ceil(route.duration / 60)} دقيقة`);
                }
            } catch {
                setRouteError(true);
            } finally {
                setLoadingRoute(false);
            }
        };

        fetchRoute();
    }, [hasValidData, userLat, userLng, pharmLat, pharmLng]);

    // Build HTML once route is ready (or failed)
    const mapHtml = useMemo(() => {
        if (!hasValidData) return "";
        return buildLeafletHtml(
            userLat!,
            userLng!,
            pharmLat!,
            pharmLng!,
            JSON.stringify(routeCoords),
            pharmacyData?.name ?? ""
        );
    }, [hasValidData, userLat, userLng, pharmLat, pharmLng, routeCoords, pharmacyData?.name]);

    // ── Guard: no valid data ──────────────────────────────────────────────────
    if (!hasValidData) {
        return (
            <View
                className="flex-1 items-center justify-center bg-[#F8FAFB] px-6"
                style={{ paddingTop: insets.top }}
            >
                <AlertCircle size={48} color="#CBD5E1" />
                <Text
                    className="text-[17px] text-[#1A2332] mt-4 text-center"
                    style={{ fontFamily: "Bein-Black" }}
                >
                    تعذر تحميل بيانات الموقع
                </Text>
                <Text
                    className="text-[13px] text-[#7A8A9A] mt-1 text-center"
                    style={{ fontFamily: "Bein" }}
                >
                    يرجى التأكد من تفعيل خدمة الموقع واختيار صيدلية تحتوي على إحداثيات
                </Text>
                <Pressable
                    onPress={() => router.back()}
                    className="mt-6 bg-[#2B9C8E] px-8 py-3 rounded-[14px]"
                >
                    <Text className="text-white text-[14px]" style={{ fontFamily: "Bein-Black" }}>
                        رجوع
                    </Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F8FAFB]">
            <View className="bg-primary w-full h-10" />

            {/* ── Header overlay ───────────────────────────────────────── */}
            <View
                className="absolute top-4 left-0 right-0 z-10 px-5 flex-row items-center"
                style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}
            >
                <Pressable
                    onPress={() => router.back()}
                    hitSlop={14}
                    className="w-[42px] h-[42px] rounded-full bg-white items-center justify-center border border-[#EBF5F4]"
                    style={{ elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 }}
                >
                    <ChevronRight size={22} color="#2B9C8E" />
                </Pressable>
            </View>

            {/* ── Leaflet Map (WebView) ─────────────────────────────────── */}
            {loadingRoute ? (
                <View className="flex-1 items-center justify-center bg-[#EAF5F4]">
                    <ActivityIndicator size="large" color="#2B9C8E" />
                    <Text className="text-[14px] text-[#2B9C8E] mt-3" style={{ fontFamily: "Bein" }}>
                        جاري تحميل المسار...
                    </Text>
                </View>
            ) : (
                <WebView
                    originWhitelist={["*"]}
                    source={{ html: mapHtml, baseUrl: "https://leafletjs.com" }}
                    style={{ flex: 1 }}
                    javaScriptEnabled
                    domStorageEnabled
                    startInLoadingState
                    renderLoading={() => (
                        <View className="absolute inset-0 items-center justify-center bg-[#EAF5F4]">
                            <ActivityIndicator size="large" color="#2B9C8E" />
                        </View>
                    )}
                />
            )}

            {/* ── Bottom Sheet ─────────────────────────────────────────── */}
            <View
                className="bg-white rounded-t-[28px] px-5 pt-5"
                style={{
                    paddingBottom: insets.bottom + 16,
                    elevation: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                }}
            >
                {/* Drag handle */}
                <View className="items-center mb-4">
                    <View className="w-10 h-1 bg-[#E2E8F0] rounded-full" />
                </View>

                {/* Route stats */}
                <View className="flex-row-reverse bg-[#F8FAFB] rounded-[16px] border border-[#EBF5F4] mb-4 overflow-hidden">
                    <View className="flex-1 items-center py-3 px-2">
                        <View className="flex-row items-center gap-1 mb-0.5">
                            <CarFront size={16} color="#2B9C8E" />
                            <Text className="text-[11px] text-[#7A8A9A]" style={{ fontFamily: "Bein" }}>
                                وقت القيادة بالسيارة
                            </Text>
                        </View>
                        <Text className="text-[20px] text-gray-700" style={{ fontFamily: "Bein-Black" }}>
                            {loadingRoute ? "—" : routeError ? "—" : duration}
                        </Text>
                        {!loadingRoute && !routeError && (
                            <Text className="text-[10px] text-[#B0BEC5] mt-0.5" style={{ fontFamily: "Bein" }}>
                                تقريبي بدون ازدحام
                            </Text>
                        )}
                    </View>
                    <View className="w-[1px] bg-[#EBF5F4] my-3" />
                    <View className="flex-1 items-center py-3 px-2">
                        <View className="flex-row items-center gap-1 mb-0.5">
                            <Text className="text-[11px] text-[#7A8A9A]" style={{ fontFamily: "Bein" }}>
                                مسافة الطريق
                            </Text>
                        </View>
                        <Text className="text-[20px] text-gray-700" style={{ fontFamily: "Bein-Black" }}>
                            {loadingRoute ? "—" : routeError ? "—" : distance}
                        </Text>
                        {!loadingRoute && !routeError && (
                            <Text className="text-[10px] text-[#B0BEC5] mt-0.5" style={{ fontFamily: "Bein" }}>
                                مسافة الطريق الفعلية
                            </Text>
                        )}
                    </View>
                </View>

                {/* Pharmacy info row */}
                <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1 items-start mr-2">
                        <Text
                            className="text-[17px] text-gray-700"
                            style={{ fontFamily: "Bein-Black" }}
                            numberOfLines={1}
                        >
                            {pharmacyData.name}
                        </Text>
                        <View className="flex-row-reverse items-center gap-1 mt-0.5">
                            <Text
                                className="text-[12px] text-[#7A8A9A]"
                                style={{ fontFamily: "Bein" }}
                                numberOfLines={1}
                            >
                                {pharmacyData.address}
                            </Text>
                            <MapPin size={12} color="#7A8A9A" />
                        </View>
                    </View>

                    {pharmacyData.rating?.average > 0 && (
                        <View className="flex-row items-center bg-[#FFF8E6] px-2 py-1 rounded-[8px] border border-[#FEE199] gap-1">
                            <Star size={12} color="#F59E0B" fill="#F59E0B" />
                            <Text className="text-[12px] text-[#D97706]" style={{ fontFamily: "Bein-Black" }}>
                                {pharmacyData.rating.average.toFixed(1)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Hours + phone */}
                <View className="flex-row flex-wrap justify-between gap-x-4 gap-y-1.5 mt-1 mb-4">
                    {pharmacyData.phone ? (
                        <Pressable
                            className="flex-row-reverse items-center gap-1.5"
                            onPress={() => Linking.openURL(`tel:${pharmacyData.phone}`)}
                        >
                            <Text className="text-[12px] text-[#2B9C8E]" style={{ fontFamily: "Bein" }}>
                                {pharmacyData.phone}
                            </Text>
                            <Phone size={13} color="#2B9C8E" />
                        </Pressable>
                    ) : null}
                    <View className="flex-row items-center gap-1.5">
                        <Clock size={13} color={pharmacyData.isOpen ? "#059669" : "#DC2626"} />
                        <Text
                            className={`text-[12px] ${pharmacyData.isOpen ? "text-[#059669]" : "text-[#DC2626]"}`}
                            style={{ fontFamily: "Bein-Black" }}
                        >
                            {pharmacyData.isOpen
                                ? pharmacyData.closingTime
                                    ? `مفتوح حتى ${pharmacyData.closingTime}`
                                    : "مفتوح الآن"
                                : "مغلق الآن"}
                        </Text>
                    </View>

                    
                </View>

                {/* Navigate button */}
                <Pressable
                    onPress={() =>
                        Linking.openURL(
                            `https://www.google.com/maps/dir/?api=1&destination=${pharmLat},${pharmLng}&travelmode=driving`
                        )
                    }
                    className="bg-[#2B9C8E] h-[52px] rounded-[16px] flex-row-reverse items-center justify-center gap-2 active:opacity-80"
                >
                    <Text className="text-white text-[15px]" style={{ fontFamily: "Bein-Black" }}>
                        فتح في خرائط جوجل
                    </Text>
                    <Navigation size={17} color="white" />
                </Pressable>
            </View>
        </View>
    );
}
