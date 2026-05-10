import { useState, useEffect, useCallback } from "react";
import { renderToString } from "react-dom/server";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Navigation,
  AlertCircle,
  Info,
  CheckCircle,
  LoaderIcon,
  Hospital,
  Stethoscope,
  Building2,
  MapPin,
  Heart,
} from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const clinicIcon = createLucideMarker({ icon: Hospital });

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center)
      map.setView(center, zoom || map.getZoom(), {
        animate: true,
        duration: 1,
      });
  }, [center, zoom, map]);
  return null;
}

export default function LocationPickerMap({
  selectedLocation,
  onLocationSelect,
  savedLocation,
}) {
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const defaultCenter = { lat: 13.57952, lng: 44.02091 }; 
  const mapCenter = selectedLocation || savedLocation?.latLng || defaultCenter;

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("المتصفح لا يدعم تحديد الموقع الجغرافي");
      return;
    }
    setGettingLocation(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onLocationSelect({ lat: coords.latitude, lng: coords.longitude });
        setGettingLocation(false);
      },
      (err) => {
        setGettingLocation(false);
        const msgs = {
          1: "تم رفض إذن تحديد الموقع. يرجى السماح للمتصفح بالوصول.",
          2: "تعذّر تحديد الموقع. تأكد من تفعيل GPS.",
          3: "انتهت مهلة تحديد الموقع. حاول مرة أخرى.",
        };
        setLocationError(msgs[err.code] || "خطأ في تحديد الموقع");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [onLocationSelect]);

  return (
    <div className="flex flex-col gap-3">
      {/* CONTROLS */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          disabled={gettingLocation}
          onClick={handleGetCurrentLocation}
          className="flex items-center gap-2 px-4 h-[38px] bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
          {gettingLocation ? (
            <>
              <LoaderIcon size={14} className="animate-spin" /> جاري تحديد
              موقعك...
            </>
          ) : (
            <>
              <Navigation size={14} /> موقعي الحالي
            </>
          )}
        </button>

        {selectedLocation && (
          <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2">
            <CheckCircle size={14} className="text-primary shrink-0" />
            <span className="text-xs font-mono text-gray-600" dir="ltr">
              Lat: {selectedLocation.lat.toFixed(5)} | Lng:{" "}
              {selectedLocation.lng.toFixed(5)}
            </span>
          </div>
        )}
      </div>

     
      {locationError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <p className="text-red-500 text-sm">{locationError}</p>
        </div>
      )}

     
      <div className="flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-xl px-4 py-2.5">
        <Info size={14} className="text-primary shrink-0" />
        <p className="text-primary text-sm">
          انقر على الخريطة لتحديد موقع عيادتك
        </p>
      </div>

      <div
        className={`w-full rounded-xl overflow-hidden transition-all duration-300 ${
          selectedLocation
            ? "border-2 border-primary shadow-md"
            : "border-2 border-gray-200"
        }`}
        style={{ height: "380px" }}>
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
             >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={onLocationSelect} />

          {selectedLocation && (
            <MapViewController
              center={[selectedLocation.lat, selectedLocation.lng]}
              zoom={15}
            />
          )}

          {selectedLocation && (
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={clinicIcon}>
              <Popup>
                <div className="text-center min-w-[150px] p-1">
                  <div className="font-black text-primary text-sm flex items-center justify-center gap-3">
                    <Hospital size={20} /> <span>موقع العيادة</span>
                  </div>
                  <hr className="my-1.5 border-gray-100" />
                  <div className="text-xs text-gray-500 space-y-0.5" dir="ltr">
                    <p>Lat: {selectedLocation.lat.toFixed(6)}</p>
                    <p>Lng: {selectedLocation.lng.toFixed(6)}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {savedLocation?.latLng && !selectedLocation && (
            <Marker
              position={[savedLocation.latLng.lat, savedLocation.latLng.lng]}
              icon={clinicIcon}>
              <Popup>
                <div className="text-center p-1">
                  <div className="font-black text-primary text-sm flex items-center justify-center gap-3">
                    <Hospital size={20} /> <span>الموقع المحفوظ</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}




/* ── helper: converts any Lucide icon to divIcon ── */
function createLucideMarker({ icon: Icon, bgColor = "#0d9488", size = 42 }) {
  const iconHtml = renderToString(
    <Icon
      size={22}
      color="white"
      strokeWidth={2}
      style={{ transform: "rotate(45deg)" }}
    />,
  );

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;height:${size}px;
        background:${bgColor};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 4px 14px ${bgColor}70;
        display:flex;align-items:center;justify-content:center;">
        ${iconHtml}
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -(size + 4)],
  });
}

/* ── استخدامه ── */
// const clinicIcon = createLucideMarker({ icon: Stethoscope });
// const hospitalIcon = createLucideMarker({
//   icon: Building2,
//   bgColor: "#0369a1",
// });
// const locationIcon = createLucideMarker({ icon: MapPin, bgColor: "#dc2626" });
// const heartIcon = createLucideMarker({ icon: Heart, bgColor: "#9333ea" });