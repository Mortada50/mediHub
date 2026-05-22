import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pause,
  Play,
  Save,
  X,
  Edit2,
  LoaderIcon,
  Sun,
} from "lucide-react";
import { useSchedule } from "../hooks/useSchedule.js";
import PageLoader from "../components/PageLoader.jsx";
import TableErrorUI from "../components/TableErrorUi.jsx";
/* ── constants ── */
const DAYS = [
  { name: "السبت", short: "سب", dayNumber: 0 },
  { name: "الأحد", short: "أح", dayNumber: 1 },
  { name: "الإثنين", short: "ثن", dayNumber: 2 },
  { name: "الثلاثاء", short: "ثل", dayNumber: 3 },
  { name: "الأربعاء", short: "أر", dayNumber: 4 },
  { name: "الخميس", short: "خم", dayNumber: 5 },
  { name: "الجمعة", short: "جم", dayNumber: 6 },
];

const TIME_OPTIONS = [
  "0:00",
  "0:30",
  "1:00",
  "1:30",
  "2:00",
  "2:30",
  "3:00",
  "3:30",
  "4:00",
  "4:30",
  "5:00",
  "5:30",
  "6:00",
  "6:30",
  "7:00",
  "7:30",
  "8:00",
  "8:30",
  "9:00",
  "9:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
  // "24:00",
];

const SESSION_BOUNDS = {
  صباحا: {
    startMin: 0,
    startMax: 11 * 60 + 30,
    endMin: 1,
    endMax: 15 * 60,
  },
  مساء: {
    startMin: 12 * 60,
    startMax: 23 * 60 + 30,
    endMin: 1,
    endMax: 24 * 60,
  },
};

/* ══════════════════════════════════════════
   ── TIME HELPER FUNCTIONS ──
══════════════════════════════════════════ */

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function compareTimes(a, b) {
  const ma = timeToMinutes(a);
  const mb = timeToMinutes(b);
  if (ma < mb) return -1;
  if (ma > mb) return 1;
  return 0;
}

function isTimeOverlap(startA, endA, startB, endB) {
  const msA = timeToMinutes(startA);
  const meA = timeToMinutes(endA);
  const msB = timeToMinutes(startB);
  const meB = timeToMinutes(endB);
  return msA < meB && msB < meA;
}

function validateSession(newSession, existingSessions, excludeId = null) {
  const { startTime, endTime, type } = newSession;

  if (compareTimes(endTime, startTime) <= 0) {
    return "وقت الانتهاء يجب أن يكون بعد وقت البداية";
  }

  const bounds = SESSION_BOUNDS[type];
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);

  if (type === "صباحا") {
    if (startMins < bounds.startMin || startMins > bounds.startMax) {
      return "بداية الفترة الصباحية يجب أن تكون بين 12:00 صباحاً و 11:30 صباحاً";
    }
    if (endMins > bounds.endMax) {
      return "نهاية الفترة الصباحية لا يمكن أن تتجاوز 3:00 مساءً";
    }
  } else if (type === "مساء") {
    if (startMins < bounds.startMin || startMins > bounds.startMax) {
      return "بداية الفترة المسائية يجب أن تكون بين 12:00 ظهراً و 11:30 مساءً";
    }
    if (endMins > bounds.endMax) {
      return "نهاية الفترة المسائية لا يمكن أن تتجاوز 12:00 صباحاً";
    }
  }

  const others = existingSessions.filter((s) => s._id !== excludeId);

  for (const s of others) {
    if (s.type === type) {
      return `فترة ${type === "صباحا" ? "الصباحية" : "المسائية"} موجودة مسبقاً`;
    }
    if (isTimeOverlap(startTime, endTime, s.startTime, s.endTime)) {
      return `تتداخل مع الفترة ${s.type === "صباحا" ? "الصباحية" : "المسائية"} (${formatTime(s.startTime)} - ${formatTime(s.endTime)})`;
    }
  }

  return null;
}

function formatTime(time) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const suffix = h < 12 ? "ص" : "م";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")}${suffix}`;
}



const INITIAL_SCHEDULE = DAYS.map((d) => ({
  ...d,
  isActive: false,
  sessions: [],
}));

const sessionStyle = (session) => {
  if (!session.isActive)
    return {
      bg: "bg-gray-200",
      dot: "bg-gray-400",
      text: "text-gray-400 line-through",
    };
  if (session.type === "صباحا")
    return { bg: "bg-[#8B7A00]", dot: "bg-yellow-300", text: "text-white" };
  return { bg: "bg-[#1B2E5E]", dot: "bg-blue-300", text: "text-white" };
};

/* ── Error Toast ── */


function InlineAddSession({ onSave, onCancel, day, onError, isLoading }) {
  const sessionOptions = [
    { value: "صباحا", label: "صباحية" },
    { value: "مساء", label: "مسائية" },
  ];

  const existingTypes = day?.sessions?.map((s) => s.type) || [];
  const availableOptions = sessionOptions.filter(
    (opt) => !existingTypes.includes(opt.value),
  );

  // ── فلترة أوقات البداية حسب النوع ──
  const getStartTimes = (t) =>
    TIME_OPTIONS.filter((opt) => {
      const m = timeToMinutes(opt);
      return m >= SESSION_BOUNDS[t].startMin && m <= SESSION_BOUNDS[t].startMax;
    });

  // ── إصلاح #3: فلترة أوقات النهاية حسب النوع و startTime الحالي ──
  const getEndTimes = (t, currentStartTime) =>
    TIME_OPTIONS.filter((opt) => {
      const m = timeToMinutes(opt);
      const startMins = currentStartTime
        ? timeToMinutes(currentStartTime)
        : SESSION_BOUNDS[t].startMin;
      return m > startMins && m <= SESSION_BOUNDS[t].endMax;
    });

  // ── إصلاح #1: القيم الافتراضية مشتقة من النوع ──
  const initialType = availableOptions[0]?.value || "";
  const initialStarts = initialType ? getStartTimes(initialType) : [];
  const initialEnds = initialType
    ? getEndTimes(initialType, initialStarts[0] || "")
    : [];

  const [type, setType] = useState(initialType);
  const [startTime, setStartTime] = useState(initialStarts[0] || "");
  const [endTime, setEndTime] = useState(
    initialEnds[initialEnds.length - 1] || "",
  );

  const handleTypeChange = (newType) => {
    setType(newType);
    const starts = getStartTimes(newType);
    const newStart = starts[0] || "";
    const ends = getEndTimes(newType, newStart);
    setStartTime(newStart);
    setEndTime(ends[ends.length - 1] || "");
  };

  // ── إصلاح #4: عند تغيير startTime، أعد ضبط endTime إذا لزم ──
  const handleStartTimeChange = (newStart) => {
    setStartTime(newStart);
    if (compareTimes(endTime, newStart) <= 0) {
      const validEnds = getEndTimes(type, newStart);
      setEndTime(validEnds[validEnds.length - 1] || "");
    }
  };

  const handleSave = () => {
    const error = validateSession({ startTime, endTime, type }, day.sessions);
    if (error) {
      onError(error);
      return;
    }
    onSave({ type, startTime, endTime });
  };

  const startOptions = getStartTimes(type);
  // ── إصلاح #3: تمرير startTime لـ getEndTimes ──
  const endOptions = getEndTimes(type, startTime);

  return (
    <div className="flex items-center gap-2 mt-1 flex-wrap">
      <select
        value={type}
        onChange={(e) => handleTypeChange(e.target.value)}
        className="h-[36px] bg-background-primary rounded-lg px-2 text-xs text-primary border border-transparent focus:outline-none focus:border-primary/30 flex-1 min-w-[80px] no-scrollbar">
        {availableOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={startTime}
        onChange={(e) => handleStartTimeChange(e.target.value)}
        className="h-[36px] bg-background-primary rounded-lg px-2 text-xs text-primary border border-transparent focus:outline-none flex-1 min-w-[80px] no-scrollbar">
        {startOptions.map((t) => (
          <option key={t} value={t}>
            {formatTime(t)}
          </option>
        ))}
      </select>

      <select
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="h-[36px] bg-background-primary rounded-lg px-2 text-xs text-primary border border-transparent focus:outline-none flex-1 min-w-[80px] no-scrollbar">
        {endOptions.map((t) => (
          <option key={t} value={t}>
            {formatTime(t)}
          </option>
        ))}
      </select>

      <button
        disabled={isLoading}
        onClick={handleSave}
        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer">
        {isLoading ? (
          <LoaderIcon className="size-4 animate-spin" />
        ) : (
          <Save size={14} />
        )}
      </button>
      <button
        disabled={isLoading}
        onClick={onCancel}
        className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer">
        <X size={14} />
      </button>
    </div>
  );
}

function SessionRow({
  session,
  allSessions,
  onDelete,
  onToggle,
  onEdit,
  onError,
  isLoading,
}) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    startTime: session.startTime,
    endTime: session.endTime,
  });
  const [loading, setLoading] = useState({
    toggleSession: "",
    deleteSession: "",
  });

  useEffect(() => {
    if (!isLoading) {
      setLoading({ toggleSession: "", deleteSession: "" });
      setEditing(false);
    }
  }, [!isLoading]);

  useEffect(() => {
    setEditForm({
      startTime: session.startTime,
      endTime: session.endTime,
    });
  }, [session.startTime, session.endTime]);

  const s = sessionStyle(session);

  // ── إصلاح #5: فلترة أوقات التعديل حسب نوع الجلسة ──
  const getEditStartTimes = () =>
    TIME_OPTIONS.filter((opt) => {
      const m = timeToMinutes(opt);
      return (
        m >= SESSION_BOUNDS[session.type].startMin &&
        m <= SESSION_BOUNDS[session.type].startMax
      );
    });

  const getEditEndTimes = (currentStart) =>
    TIME_OPTIONS.filter((opt) => {
      const m = timeToMinutes(opt);
      const startMins = currentStart
        ? timeToMinutes(currentStart)
        : SESSION_BOUNDS[session.type].startMin;
      return m > startMins && m <= SESSION_BOUNDS[session.type].endMax;
    });

  // ── إصلاح #4 في SessionRow: عند تغيير startTime أعد ضبط endTime ──
  const handleEditStartChange = (newStart) => {
    setEditForm((p) => {
      const newEnd =
        compareTimes(p.endTime, newStart) <= 0
          ? getEditEndTimes(newStart).slice(-1)[0] || p.endTime
          : p.endTime;
      return { startTime: newStart, endTime: newEnd };
    });
  };

  const handleEditSave = () => {
    const error = validateSession(
      {
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        type: session.type,
      },
      allSessions,
      session._id,
    );
    if (error) {
      onError(error);
      return;
    }
    onEdit(session._id, editForm);
  };

  const handleCancel = () => {
    setEditForm({
      startTime: session.startTime,
      endTime: session.endTime,
    });
    setEditing(false);
  };

  if (editing) {
    const editStartOptions = getEditStartTimes();

    const editEndOptions = getEditEndTimes(editForm.startTime);

    return (
      <div className={`${s.bg} rounded-xl px-3 py-2 flex items-center gap-2`}>
        <select
          value={editForm.startTime}
          onChange={(e) => handleEditStartChange(e.target.value)}
          className="h-[28px] bg-white/20 text-white text-xs rounded-lg px-2 flex-1 focus:outline-none no-scrollbar">
          {editStartOptions.map((t) => (
            <option className={s.bg} key={t} value={t}>
              {formatTime(t)}
            </option>
          ))}
        </select>
        <span className="text-white/60 text-xs">—</span>
        <select
          value={editForm.endTime}
          onChange={(e) =>
            setEditForm((p) => ({ ...p, endTime: e.target.value }))
          }
          className="h-[28px] bg-white/20 text-white text-xs rounded-lg px-2 flex-1 focus:outline-none no-scrollbar">
          {editEndOptions.map((t) => (
            <option className={s.bg} key={t} value={t}>
              {formatTime(t)}
            </option>
          ))}
        </select>
        <button
          disabled={isLoading}
          onClick={handleEditSave}
          className="p-1 rounded bg-white/20 hover:bg-white/40 transition-colors cursor-pointer">
          {isLoading ? (
            <LoaderIcon className="size-4 animate-spin" />
          ) : (
            <Save size={13} className="text-white" />
          )}
        </button>
        <button
          disabled={isLoading}
          onClick={handleCancel}
          className="p-1 rounded bg-white/10 hover:bg-white/30 transition-colors cursor-pointer">
          <X size={13} className="text-white" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${s.bg} rounded-xl px-3 py-2 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <div className={`size-2.5 rounded-full ${s.dot} shrink-0`} />
        <span className="text-white/70 text-xs">
          {session.type === "صباحا" ? "صباح" : "مساء"}
        </span>
        <span className={`text-xs font-semibold ${s.text}`}>
          {formatTime(session.startTime)} - {formatTime(session.endTime)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          disabled={isLoading}
          onClick={() => {
            setLoading((prev) => ({ ...prev, toggleSession: session._id }));
            onToggle(session._id);
          }}
          className="p-1 rounded bg-white/10 hover:bg-yellow-500 transition-colors cursor-pointer">
          {loading.toggleSession === session._id ? (
            <LoaderIcon className="size-4 animate-spin" />
          ) : session.isActive ? (
            <Pause size={13} className="text-white" />
          ) : (
            <Play size={13} className="text-white" />
          )}
        </button>
        <button
          disabled={isLoading}
          onClick={() => setEditing(true)}
          className="p-1 rounded bg-white/10 hover:bg-blue-500 transition-colors cursor-pointer">
          <Edit2 size={13} className="text-white" />
        </button>
        <button
          disabled={isLoading}
          onClick={() => {
            onDelete(session._id);
            setLoading((prev) => ({ ...prev, deleteSession: session._id }));
          }}
          className="p-1 rounded bg-white/10 hover:bg-red-500 transition-colors cursor-pointer">
          {loading.deleteSession === session._id ? (
            <LoaderIcon className="size-4 animate-spin" />
          ) : (
            <Trash2 size={13} className="text-white" />
          )}
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   DAY CARD
─────────────────────────────────────────── */
function DayCard({
  day,
  onToggleDay,
  onDeleteDay,
  onAddSession,
  onDeleteSession,
  onToggleSession,
  onEditSession,
  onError,
  isLoading,
}) {
  const [showInlineAdd, setShowInlineAdd] = useState(false);
  const [loading, setLoading] = useState({
    toggleDay: -1,
    deleteSessions: -1,
  });

  useEffect(() => {
    if (!isLoading) {
      setLoading({ toggleDay: -1, deleteSessions: -1 });
      setShowInlineAdd(false);
    }
  }, [!isLoading]);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <h3 className="text-gray-700 font-black text-base">{day.name}</h3>
        <div className="flex items-center gap-2">
          {day.isActive ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              <span className="size-1.5 rounded-full bg-primary inline-block" />
              نشط
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full line-through">
              <span className="size-1.5 rounded-full bg-gray-400 inline-block" />
              معطل
            </span>
          )}
          <button
            disabled={isLoading}
            onClick={() => {
              setLoading((prev) => ({ ...prev, toggleDay: day.dayNumber }));
              onToggleDay(day.dayNumber, day.name);
            }}
            className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-500 hover:text-yellow-600 transition-colors cursor-pointer">
            {isLoading && loading.toggleDay === day.dayNumber ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : day.isActive ? (
              <Pause size={15} />
            ) : (
              <Play size={15} />
            )}
          </button>
          <button
            disabled={day?.sessions?.length === 0 || isLoading}
            onClick={() => {
              setLoading((prev) => ({
                ...prev,
                deleteSessions: day.dayNumber,
              }));

              onDeleteDay(day.dayNumber);
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors cursor-pointer">
            {isLoading && loading.deleteSessions === day.dayNumber ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2">
        {day.sessions.length === 0 && !showInlineAdd ? (
          <div className="text-center py-4 text-gray-300 text-sm">
            لا توجد جلسات
          </div>
        ) : (
          day.sessions.map((session) => (
            <SessionRow
              key={session._id}
              session={session}
              allSessions={day.sessions}
              onDelete={(id) => onDeleteSession(day.dayNumber, id)}
              onToggle={(id) => onToggleSession(day.dayNumber, id)}
              onEdit={(id, data) => onEditSession(day.dayNumber, id, data)}
              onError={onError}
              isLoading={isLoading}
            />
          ))
        )}

        {showInlineAdd && (
          <InlineAddSession
            onSave={(data) => {
              onAddSession(day.dayNumber, data);
            }}
            onCancel={() => setShowInlineAdd(false)}
            day={day}
            onError={onError}
            isLoading={isLoading}
          />
        )}

        {!showInlineAdd && day.sessions.length < 2 && day.isActive && (
          <button
            disabled={isLoading}
            onClick={() => {
              setShowInlineAdd(true);
            }}
            className="flex items-center justify-center gap-1.5 w-full h-[34px] border border-dashed border-primary/30 rounded-xl text-primary text-xs font-semibold hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer mt-1">
            <Plus size={13} />
            إضافة جلسة
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   WEEK STRIP
─────────────────────────────────────────── */
function WeekStrip({ weekDates, schedule }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-start gap-4 mb-4 pb-3 border-b border-gray-50">
        {[
          { color: "bg-[#8B7A00]", label: "صباحية" },
          { color: "bg-[#1B2E5E]", label: "مسائية" },
          { color: "bg-gray-300", label: "عطلة" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`size-3 rounded-sm ${l.color}`} />
            <span className="text-gray-400 text-xs">{l.label}</span>
          </div>
        ))}
      </div>
      <div
        className="flex items-stretch gap-2 overflow-x-auto no-scrollbar"
        dir="rtl">
        {weekDates.map((d) => {
          const dayData = schedule.find((s) => s.dayNumber === d.dayNumber);
          const hasActive = dayData?.sessions?.some((s) => s.isActive);

          return (
            <div
              key={d.dayNumber}
              className={`flex flex-col items-center min-w-[80px] flex-1 rounded-xl p-3 border-2 transition-all ${
                d.isToday
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-background-primary"
              }`}>
              <span className="text-gray-400 text-xs font-semibold">
                {d.short}
              </span>
              <span
                className={`font-black text-2xl mt-0.5 ${d.isToday ? "text-primary" : "text-gray-700"}`}>
                {d.date}
              </span>
              <div className="flex flex-col gap-1 mt-2 w-full">
                {!dayData?.isActive || !hasActive || d?.isOnLeave ? (
                  <div className="h-[22px] bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-[10px] font-semibold">
                      {d?.isOnLeave ? "إجازة" : "عطلة"}
                    </span>
                  </div>
                ) : (
                  dayData?.sessions?.map((s) => (
                    <div
                      key={s._id}
                      className={`h-[22px] rounded-lg flex items-center justify-center px-1 ${
                        !s.isActive
                          ? "bg-gray-200"
                          : s.type === "صباحا"
                            ? "bg-[#8B7A00]"
                            : "bg-[#1B2E5E]"
                      }`}>
                      <span className="text-white text-[10px] font-semibold truncate">
                        {formatTime(s.startTime)} - {formatTime(s.endTime)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   MAIN PAGE
─────────────────────────────────────────── */
export default function WeeklySchedule() {
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [errorMsg, setErrorMsg] = useState(null);

  const showError = (msg) => setErrorMsg(msg);

  const {
    weeklyScheduleData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,

    toggleDayMutation,
    isTogglingDayLoading,
    toggleDayError,

    addSessionMutation,
    isAddingSessionLoading,
    isAddingSessionError,
    addSessionError,

    deleteSessionMutation,
    isDeletingSessionLoading,
    isDeletingSessionError,
    deleteSessionError,

    clearDaySessionsMutation,
    isClearingDaySessionsLoading,
    isClearingDaySessionsError,
    clearDaySessionsError,

    toggleSessionMutation,
    isTogglingSessionLoading,
    isTogglingSessionError,
    toggleSessionError,

    updateSessionMutation,
    isUpdatingSessionLoading,
    isUpdatingSessionError,
    updateSessionError,
  } = useSchedule();

  const toggleDay = (dayNumber, name) => {
    toggleDayMutation(
      { dayNumber, name },
      {
        onError: () => setErrorMsg(toggleDayError?.data?.message),
      },
    );
  };

  const deleteDay = (dayNumber) =>
    clearDaySessionsMutation(dayNumber, {
      onError: () => setErrorMsg(clearDaySessionsError?.data?.message),
    });

  const addSession = (dayNumber, data) => {
    const day = schedule.find((d) => d.dayNumber === dayNumber);
    const error = validateSession(data, day.sessions);
    if (error) {
      showError(error);
      return;
    }
    addSessionMutation(
      { dayNumber, ...data },
      {
        onError: () => setErrorMsg(addSessionError?.data?.message),
      },
    );
  };

  const deleteSession = (dayNumber, id) =>
    deleteSessionMutation(
      { dayNumber, id },
      {
        onError: () => setErrorMsg(deleteSessionError?.data?.message),
      },
    );

  const toggleSession = (dayNumber, id) =>
    toggleSessionMutation(
      { dayNumber, id },
      {
        onError: () => setErrorMsg(toggleSessionError?.data?.message),
      },
    );

  const editSession = (dayNumber, id, data) => {
   
    const day = schedule.find((d) => d.dayNumber === dayNumber);
    const session = day.sessions.find((s) => s._id === id);
    const error = validateSession(
      {
        startTime: data.startTime,
        endTime: data.endTime,
        type: session.type,
      },
      day.sessions,
      id,
    );
    if (error) {
      showError(error);
      return;
    }
    
    updateSessionMutation(
      { dayNumber, id, ...data },
      {
        onError: () => setErrorMsg(updateSessionError?.data?.message),
      },
    );
  };

  useEffect(() => {
    if (!isLoading && weeklyScheduleData) {

      const weeklySchedule = weeklyScheduleData?.weeklySchedule;

      const intial = DAYS.map((day) => ({
        ...day,
        isActive:
          weeklySchedule.filter((d) => day.dayNumber === d.dayNumber)[0]
            ?.isActive || false,
        sessions:
          weeklySchedule.filter((d) => day.dayNumber === d.dayNumber)[0]
            ?.sessions || [],
      }));

      setSchedule(intial);
    }
  }, [weeklyScheduleData, isLoading]);

  if (isLoading) return <PageLoader />;

  if (isError || !weeklyScheduleData) {
    return (
      <table className="flex items-center justify-center h-full">
        <tbody>
          <TableErrorUI
            message={error?.message}
            onRetry={() => refetch()}
            onloading={isFetching}
          />
        </tbody>
      </table>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      <ErrorToast message={errorMsg} onClear={() => setErrorMsg(null)} />

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start">
          <h1 className="text-primary font-black text-xl sm:text-2xl">
            الجدول الاسبوعي
          </h1>
        </div>
      </div>

      <WeekStrip weekDates={weeklyScheduleData?.weekDays} schedule={schedule} />

      <div className="flex items-center justify-between">
        <h2 className="text-gray-700 font-black text-lg">إدارة الجلسات</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {schedule.map((day) => (
          <DayCard
            key={day.dayNumber}
            day={day}
            onToggleDay={toggleDay}
            onDeleteDay={deleteDay}
            onAddSession={addSession}
            onDeleteSession={deleteSession}
            onToggleSession={toggleSession}
            onEditSession={editSession}
            onError={showError}
            isLoading={
              isTogglingDayLoading ||
              isDeletingSessionLoading ||
              isAddingSessionLoading ||
              isClearingDaySessionsLoading ||
              isTogglingSessionLoading ||
              isUpdatingSessionLoading
            }
          />
        ))}
      </div>
    </div>
  );
}
