import { useState } from "react";
import { X, MapPin, CheckCircle } from "lucide-react";
import LocationPickerMap from "./LocationPickerMap";

export default function LocationPickerModal({
  savedLocation,
  onConfirm,
  onClose,
}) {
  const [newLocation, setNewLocation] = useState(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-6"
      onClick={onClose}>
      <div
        className="bg-background-primary rounded-2xl shadow-2xl w-full max-w-[720px] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-2xl border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <h2 className="text-primary font-black text-base">
              تحديد موقع العيادة
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4">
          <LocationPickerMap
            selectedLocation={newLocation}
            onLocationSelect={setNewLocation}
            savedLocation={savedLocation}
          />
        </div>

        {/* FOOTER */}
        <div className="flex items-center gap-3 px-5 py-4 bg-white border-t border-gray-100 rounded-b-2xl shrink-0">
          <button
            type="button"
            disabled={!newLocation}
            onClick={() => {
              onConfirm(newLocation);
              onClose();
            }}
            className="flex-1 h-[42px] bg-primary text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            <CheckCircle size={15} />
            تأكيد الموقع
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[42px] border-2 border-gray-200 text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
