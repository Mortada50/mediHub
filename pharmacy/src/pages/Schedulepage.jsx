import React, { useState } from "react";
import { Calendar, Plus, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { useSchedule } from "../hooks/useSchedule";
import PageLoader from "../components/PageLoader";
import toast, { Toaster } from "react-hot-toast";

const ALL_DAYS = [
  { day: "السبت", dayNumber: 0 },
  { day: "الأحد", dayNumber: 1 },
  { day: "الإثنين", dayNumber: 2 },
  { day: "الثلاثاء", dayNumber: 3 },
  { day: "الأربعاء", dayNumber: 4 },
  { day: "الخميس", dayNumber: 5 },
  { day: "الجمعة", dayNumber: 6 },
];

// ─── Helper: format HH:mm to readable ────────────────────────────────────────
const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h < 12 ? "ص" : "م";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")}${period}`;
};

export default function Schedulepage() {
  const {
    scheduleData,
    isScheduleLoading,
    isScheduleError,
    scheduleError,
    refetchSchedule,
    isScheduleFetching,
    updateScheduleMutation,
    isUpdatingSchedule,
    addDayMutation,
    isAddingDay,
  } = useSchedule();

  const [editingDay, setEditingDay] = useState(null);

  const weeklySchedule = scheduleData?.weeklySchedule || [];
  const isOpen24Hours = scheduleData?.isOpen24Hours ?? false;

  const addedDayNames = new Set(weeklySchedule.map((d) => d.day));

  // ─── Handle 24/7 Toggle ───
  const handleToggle247 = () => {
    updateScheduleMutation(
      { isOpen24Hours: !isOpen24Hours },
      {
        onSuccess: () =>
          toast.success(
            !isOpen24Hours ? "تم تفعيل وضع 24/7" : "تم إلغاء وضع 24/7",
          ),
        onError: (err) =>
          toast.error(err?.message || "حدث خطأ أثناء تحديث الإعداد"),
      },
    );
  };

  // ─── Handle toggle single day open/closed ───
  const handleToggleDayOpen = (dayItem) => {
    const willBeOpen = !dayItem.isOpen;
    const updated = weeklySchedule.map((d) =>
      d._id === dayItem._id
        ? {
            ...d,
            isOpen: willBeOpen,
            is24Hours: willBeOpen
              ? !d.openTime || !d.closeTime
                ? true
                : false
              : false,
          }
        : d,
    );
    updateScheduleMutation(
      { weeklySchedule: updated },
      {
        onError: (err) =>
          toast.error(err?.message || "حدث خطأ أثناء تحديث اليوم"),
      },
    );
  };

  // ─── Handle Add Day ───
  const handleAddDay = ({ day, dayNumber }) => {
    addDayMutation(
      { day, dayNumber, isOpen: true, is24Hours: true },
      {
        onSuccess: () => toast.success(`تمت إضافة يوم ${day} إلى الجدول`),
        onError: (err) =>
          toast.error(err?.message || "حدث خطأ أثناء إضافة اليوم"),
      },
    );
  };

  // ─── Handle Save Edit ───
  const handleSaveEdit = () => {
    if (!editingDay.is24Hours && editingDay.isOpen) {
      if (!editingDay.openTime || !editingDay.closeTime) {
        toast.error("يرجى إدخال وقت الافتتاح والإغلاق");
        return;
      }
    }

    const updated = weeklySchedule.map((d) =>
      d._id === editingDay._id ? { ...editingDay } : d,
    );

    updateScheduleMutation(
      { weeklySchedule: updated },
      {
        onSuccess: () => {
          toast.success(`تم حفظ جدول يوم ${editingDay.day} بنجاح`);
          setEditingDay(null);
        },
        onError: (err) =>
          toast.error(err?.message || "حدث خطأ أثناء حفظ الجدول"),
      },
    );
  };

  // ─── Loading ───
  if (isScheduleLoading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6 pb-8 h-full" dir="rtl">
      <Toaster position="top-center" reverseOrder={false} />

      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-primary font-black text-xl sm:text-2xl">
          جدول العمل الأسبوعي
        </h1>
        <p className="text-primary font-semibold text-xs sm:text-sm">
          حدد أوقات عمل الصيدلية لكل يوم
        </p>
      </div>

      {/* ── Error State ── */}
      {isScheduleError ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-red-100 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-gray-800">تعذر جلب الجدول</h3>
            <p className="text-sm text-gray-500">
              {scheduleError?.message ||
                "تحقق من اتصالك بالإنترنت وأعد المحاولة"}
            </p>
          </div>
          <button
            onClick={refetchSchedule}
            disabled={isScheduleFetching}
            className="flex items-center gap-2 text-sm font-semibold text-primary border border-primary/30 rounded-xl px-5 py-2.5 hover:bg-primary/5 transition-colors cursor-pointer disabled:opacity-50">
            <RefreshCw
              size={15}
              className={isScheduleFetching ? "animate-spin" : ""}
            />
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <>
          {/* ── Global 24/7 Toggle ── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-primary/10 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <h2 className="font-bold text-primary text-base">
                تعمل 24 ساعة طوال الأسبوع ؟
              </h2>
              <p className="text-xs text-gray-500 font-semibold">
                عند التفعيل ستظهر الصيدلية كمفتوحة في جميع الأوقات بغض النظر عن
                الجدول.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-bold text-gray-700 hidden sm:block">
                تفعيل 24/7
              </span>
              <button
                onClick={handleToggle247}
                disabled={isUpdatingSchedule}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out cursor-pointer flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${isOpen24Hours ? "bg-primary" : "bg-gray-200"}`}>
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ease-in-out shadow-sm ${isOpen24Hours ? "right-7" : "right-1"}`}
                />
              </button>
            </div>
          </div>

          {/* ── Days Grid ── */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 transition-opacity duration-300 ${isOpen24Hours ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            {ALL_DAYS.map(({ day, dayNumber }) => {
              const dayItem = weeklySchedule.find((d) => d.day === day);
              const isAdded = addedDayNames.has(day);

              if (!isAdded) {
                return (
                  <div
                    key={day}
                    className="bg-white rounded-2xl p-4 border border-primary/10 shadow-sm flex flex-col items-center justify-between min-h-[190px]">
                    <h3 className="font-bold text-gray-800">{day}</h3>
                    <button
                      onClick={() => handleAddDay({ day, dayNumber })}
                      disabled={isAddingDay || isUpdatingSchedule}
                      className="w-10 h-10 rounded-full bg-[#E8F8F5] text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                      <Plus size={24} />
                    </button>
                    <div className="h-9" />
                  </div>
                );
              }

              return (
                <div
                  key={day}
                  className="bg-white rounded-2xl p-4 border border-primary/10 shadow-sm flex flex-col items-center gap-4 min-h-[190px]">
                  <h3 className="font-bold text-gray-800">{day}</h3>

                  {/* Toggle switch */}
                  <button
                    onClick={() => handleToggleDayOpen(dayItem)}
                    disabled={isUpdatingSchedule}
                    className={`relative w-11 h-[22px] rounded-full transition-colors duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${dayItem.isOpen ? "bg-primary" : "bg-gray-200"}`}>
                    <div
                      className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-all duration-300 ease-in-out shadow-sm ${dayItem.isOpen ? "right-[22px]" : "right-1"}`}
                    />
                  </button>

                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`font-bold text-[15px] ${dayItem.isOpen ? "text-primary" : "text-gray-500"}`}>
                      {dayItem.isOpen ? "مفتوح" : "مغلق"}
                    </span>
                    <span
                      className="text-sm font-bold text-gray-700 h-5 flex items-center justify-center"
                      dir="ltr">
                      {!dayItem.isOpen ? (
                        "-"
                      ) : dayItem.is24Hours ? (
                        <>
                          {" "}
                          <span className="pr-1"> ساعة </span> 24
                        </>
                      ) : (
                        <span dir="rtl">
                          {" "}
                          <span> {formatTime(dayItem.closeTime)}</span> -
                          <span> {formatTime(dayItem.openTime)}</span>
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Edit button */}
                  <div className="w-full mt-auto">
                    {dayItem.isOpen ? (
                      <button
                        onClick={() => setEditingDay({ ...dayItem })}
                        disabled={isUpdatingSchedule}
                        className="w-full h-9 bg-[#E8F8F5] text-primary hover:bg-[#D1F1EB] rounded-xl flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        <Calendar size={18} />
                      </button>
                    ) : (
                      <div className="w-full h-9" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Edit Day Panel ── */}
          {editingDay && !isOpen24Hours && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-primary/10 flex flex-col gap-8 animate-[fadeIn_0.2s_ease-out]">
              <h2 className="text-gray-800 font-bold text-lg border-b border-gray-100 pb-4 flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                تعديل يوم ـ {editingDay.day}
              </h2>

              <div className="flex flex-col gap-6 max-w-2xl">
                {/* 24 Hours Toggle */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-700">
                    يعمل 24 ساعة هذا اليوم
                  </span>
                  <button
                    onClick={() =>
                      setEditingDay((prev) => ({
                        ...prev,
                        is24Hours: !prev.is24Hours,
                      }))
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out cursor-pointer flex-shrink-0 ${editingDay.is24Hours ? "bg-primary" : "bg-gray-300"}`}>
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ease-in-out shadow-sm ${editingDay.is24Hours ? "right-7" : "right-1"}`}
                    />
                  </button>
                </div>

                {/* Time Fields — hidden when is24Hours */}
                {!editingDay.is24Hours && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-primary text-sm font-semibold">
                        وقت الافتتاح
                      </label>
                      <input
                        type="time"
                        value={editingDay.openTime || ""}
                        onChange={(e) =>
                          setEditingDay((prev) => ({
                            ...prev,
                            openTime: e.target.value,
                          }))
                        }
                        className="h-[48px] bg-[#F4F9F8] rounded-xl px-4 text-sm text-gray-800 font-bold border border-primary/20 focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-primary text-sm font-semibold">
                        وقت الإغلاق
                      </label>
                      <input
                        type="time"
                        value={editingDay.closeTime || ""}
                        onChange={(e) =>
                          setEditingDay((prev) => ({
                            ...prev,
                            closeTime: e.target.value,
                          }))
                        }
                        className="h-[48px] bg-[#F4F9F8] rounded-xl px-4 text-sm text-gray-800 font-bold border border-primary/20 focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isUpdatingSchedule}
                  className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2.5 px-8 rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                  {isUpdatingSchedule && (
                    <RefreshCw size={14} className="animate-spin" />
                  )}
                  {isUpdatingSchedule ? "جاري الحفظ..." : "حفظ"}
                </button>
                <button
                  onClick={() => setEditingDay(null)}
                  disabled={isUpdatingSchedule}
                  className="text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 py-2.5 px-6 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
