import React, { useState, useMemo, useEffect } from "react";
import {
  CalendarDays,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Save,
  LoaderIcon,
} from "lucide-react";

import { useLeaves } from "../hooks/useLeaves.js";
import PageLoader from "../components/PageLoader.jsx";
import TableErrorUI from "../components/TableErrorUi.jsx";
import ErrorToast from "../components/ErrorToast.jsx";

/* ── helpers ── */
const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
const DAYS_AR = ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"];

function toDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function startOfDay(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}
function formatDateAr(date) {
  if (!date) return "";
  return `${date.getDate()} ${MONTHS_AR[date.getMonth()]} ${date.getFullYear()}`;
}
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

/* ── mock data ── */
const TODAY = startOfDay(new Date());
const MOCK_LEAVES = [
  {
    _id: "l1",
    leaveType: "single",
    date: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - 19),
    startDate: null,
    endDate: null,
    durationDays: 1,
    reason: "يوم إجازة رسمية",
    status: "ended",
  },
  {
    _id: "l2",
    leaveType: "single",
    date: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 3),
    startDate: null,
    endDate: null,
    durationDays: 1,
    reason: "يوم إجازة رسمية",
    status: "upcoming",
  },
  {
    _id: "l3",
    leaveType: "range",
    date: null,
    startDate: new Date(
      TODAY.getFullYear(),
      TODAY.getMonth(),
      TODAY.getDate() + 10,
    ),
    endDate: new Date(
      TODAY.getFullYear(),
      TODAY.getMonth(),
      TODAY.getDate() + 13,
    ),
    durationDays: 4,
    reason: "مؤتمر طبي في الرياض",
    status: "upcoming",
  },
  {
    _id: "l4",
    leaveType: "range",
    date: null,
    startDate: new Date(
      TODAY.getFullYear(),
      TODAY.getMonth(),
      TODAY.getDate() - 9,
    ),
    endDate: new Date(
      TODAY.getFullYear(),
      TODAY.getMonth(),
      TODAY.getDate() - 5,
    ),
    durationDays: 4,
    reason: "مؤتمر طبي في الرياض",
    status: "ended",
  },
];

/* ── status config ── */
const STATUS_CONFIG = {
  upcoming: {
    label: "قادمة",
    dot: "bg-primary",
    badge: "bg-primary/10 text-primary",
  },
  active: {
    label: "نشطة",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-600",
  },
  ended: {
    label: "منتهية",
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-500",
  },
  cancelled: {
    label: "ملغية",
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-500",
  },
};

/* ═══════════════════════════════════════════
   CALENDAR COMPONENT
═══════════════════════════════════════════ */
function Calendar({
  year,
  month,
  leaves,
  mode,
  selectedSingle,
  rangeStart,
  rangeEnd,
  onDayClick,
}) {
  const today = TODAY;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  /* build set of leave dates for fast lookup */
  const leaveDays = useMemo(() => {
    const set = new Set();
    leaves.forEach((l) => {
      if (l.status === "cancelled") return;
      if (l.leaveType === "single" && l.date) {
        set.add(toDateKey(startOfDay(new Date(l.date))));
      } else if (l.leaveType === "range" && l.startDate && l.endDate) {
        const s = startOfDay(new Date(l.startDate));
        const e = startOfDay(new Date(l.endDate));
        const cur = new Date(s);
        while (cur <= e) {
          set.add(toDateKey(cur));
          cur.setDate(cur.getDate() + 1);
        }
      }
    });

    return set;
  }, [leaves]);

  /* max selectable date: 3 months from today */
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 3);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 mb-2">
        {DAYS_AR.map((d) => (
          <div
            key={d}
            className="text-center text-xs text-gray-400 font-semibold py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;

          const thisDate = startOfDay(new Date(year, month, day));
          const isPast = thisDate < today;
          const isToday = sameDay(thisDate, today);
          const isTooFar = thisDate > maxDate;
          const isLeave = leaveDays.has(toDateKey(thisDate));
          const isDisabled = isPast || isTooFar;

          /* single mode */
          const isSelectedSingle =
            mode === "single" &&
            selectedSingle &&
            sameDay(thisDate, selectedSingle);

          /* range mode */
          const isRangeStart =
            mode === "range" && rangeStart && sameDay(thisDate, rangeStart);
          const isRangeEnd =
            mode === "range" && rangeEnd && sameDay(thisDate, rangeEnd);
          const isInRange =
            mode === "range" &&
            rangeStart &&
            rangeEnd &&
            thisDate > rangeStart &&
            thisDate < rangeEnd;

          let cellClass =
            "relative flex items-center justify-center h-9 text-sm cursor-pointer rounded-full transition-all select-none ";

          if (isDisabled) {
            cellClass += "text-gray-300 cursor-not-allowed ";
          } else if (isSelectedSingle || isRangeStart || isRangeEnd) {
            cellClass += "bg-primary text-white font-black ";
          } else if (isInRange) {
            cellClass += "bg-primary/10 text-primary rounded-none ";
          } else if (isLeave) {
            cellClass += "bg-red-100 text-red-500 font-semibold ";
          } else if (isToday) {
            cellClass += "border-2 border-primary text-primary font-black ";
          } else {
            cellClass += "text-gray-700 hover:bg-background-primary ";
          }

          /* range edges rounding */
          let wrapClass = "";
          if (isRangeStart && rangeEnd)
            wrapClass = "bg-primary/10 rounded-r-full";
          if (isRangeEnd && rangeStart)
            wrapClass = "bg-primary/10 rounded-l-full";
          if (isInRange) {
            const col = idx % 7;
            if (col === 0) wrapClass = "bg-primary/10 rounded-r-full";
            else if (col === 6) wrapClass = "bg-primary/10 rounded-l-full";
            else wrapClass = "bg-primary/10";
          }

          return (
            <div key={day} className={`${wrapClass}`}>
              <div
                className={cellClass}
                onClick={() => !isDisabled && onDayClick(thisDate)}>
                {day}
                {isLeave &&
                  !isSelectedSingle &&
                  !isRangeStart &&
                  !isRangeEnd &&
                  !isInRange && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-red-400" />
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LEAVE CARD
═══════════════════════════════════════════ */
function LeaveCard({ leave, onDelete, onCancel, isLoading }) {
  const [isLeave, setIsLeave] = useState({
    deleting: "",
    cancelling: "",
  });

  const s = STATUS_CONFIG[leave.status] ?? STATUS_CONFIG.upcoming;
  const isRange = leave.leaveType === "range";

  const dateLabel = isRange
    ? `${formatDateAr(new Date(leave.startDate))} - ${formatDateAr(new Date(leave.endDate))}`
    : formatDateAr(new Date(leave.date));

  useEffect(() => {
    if(!isLoading){
      setIsLeave({
        deleting: "",
        cancelling: "",
      });
    }
  }, [isLoading])

  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
      {/* top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 justify-start">
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarDays size={16} className="text-primary" />
          </div>
          <span className="text-gray-800 font-black text-sm text-right">
            {dateLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {leave.status === "cancelled" || leave.status === "ended" ? (
            <button
              disabled={isLoading}
              onClick={() => {
                onDelete(leave._id);
                setIsLeave((prev) => ({ ...prev, deleting: leave._id }));
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors cursor-pointer">
              {isLoading && isLeave.deleting === leave._id ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
            </button>
          ) : (
            <button
              disabled={isLoading}
              onClick={() => {
                onCancel(leave._id);
                setIsLeave((prev) => ({ ...prev, cancelling: leave._id }));
              }}
              title="إلغاء"
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors cursor-pointer">
              {isLoading && isLeave.cancelling === leave._id ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : (
                <X size={15} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* reason */}
      {leave.reason && (
        <p className="text-gray-500 text-sm text-right truncate no-scrollbar">
          {leave.reason}
        </p>
      )}

      {/* footer badges */}
      <div className="flex items-center gap-2 justify-start flex-wrap">
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${s.badge}`}>
          <span className={`size-1.5 rounded-full ${s.dot} inline-block`} />
          {s.label}
        </span>
        <span className="text-xs text-gray-400 bg-background-primary px-2 py-1 rounded-full">
          {isRange ? "فترة" : "يوم واحد"}
        </span>
        {isRange && (
          <span className="text-xs text-gray-400 bg-background-primary px-2 py-1 rounded-full">
            {leave.durationDays} أيام
          </span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function LeavesManagementPage() {
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState("single"); // "single" | "range"
  const [selectedSingle, setSelectedSingle] = useState(null);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [reason, setReason] = useState("");
  const [overlapError, setOverlapError] = useState("");
  const [filterTab, setFilterTab] = useState("all");
  const [errorMsg, setErrorMsg] = useState(null);


  /* calendar navigation — limited to current month + 2 */
  const [calYear, setCalYear] = useState(TODAY.getFullYear());
  const [calMonth, setCalMonth] = useState(TODAY.getMonth());

  const {
    leavesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,

    addLeaveMutation,
    isAddingLeaveLoading,
    isAddingLeaveError,
    addLeaveError,

    deleteLeaveMutation,
    isDeletingLeaveLoading,
    isDeletingLeaveError,
    deleteLeaveError,

    cancelLeaveMutation,
    isCancellingLeaveLoading,
    isCancellingLeaveError,
    cancelLeaveError,
  } = useLeaves();

  const minMonth = TODAY.getMonth();
  const minYear = TODAY.getFullYear();
  const maxMonth = (TODAY.getMonth() + 2) % 12;
  const maxYear = TODAY.getFullYear() + (TODAY.getMonth() + 2 > 11 ? 1 : 0);

  const canGoBack = !(calYear === minYear && calMonth === minMonth);
  const canGoFwd = !(calYear === maxYear && calMonth === maxMonth);

  const prevMonth = () => {
    if (!canGoBack) return;
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (!canGoFwd) return;
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);
  };

  /* ── overlap check ── */
  const isOverlapping = (testStart, testEnd) => {
    for (const l of leaves) {
      if (l.status === "cancelled") continue;
      const ls =
        l.leaveType === "single"
          ? startOfDay(new Date(l.date))
          : startOfDay(new Date(l.startDate));
      const le =
        l.leaveType === "single"
          ? startOfDay(new Date(l.date))
          : startOfDay(new Date(l.endDate));
      if (testStart <= le && testEnd >= ls) return true;
    }
    return false;
  };

  /* ── day click ── */
  const handleDayClick = (date) => {
    setOverlapError("");
    if (mode === "single") {
      setSelectedSingle(date);
      setRangeStart(null);
      setRangeEnd(null);
    } else {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(date);
        setRangeEnd(null);
        setSelectedSingle(null);
      } else {
        if (date <= rangeStart) {
          setRangeStart(date);
          setRangeEnd(null);
        } else {
          setRangeEnd(date);
        }
      }
    }
  };

  /* ── save ── */
  const handleSave = () => {
    setOverlapError("");

    let testStart, testEnd, leaveType;

    if (mode === "single") {
      if (!selectedSingle) return;
      testStart = testEnd = selectedSingle;
      leaveType = "single";
    } else {
      if (!rangeStart || !rangeEnd) return;
      testStart = rangeStart;
      testEnd = rangeEnd;
      leaveType = "range";
    }

    if (isOverlapping(testStart, testEnd)) {
      setOverlapError("يوجد تداخل مع إجازة موجودة، يرجى اختيار تاريخ آخر.");
      return;
    }
    const newLeave = {
      leaveType,
      date: leaveType === "single" ? testStart : null,
      startDate: leaveType === "range" ? testStart : null,
      endDate: leaveType === "range" ? testEnd : null,
      reason,
    };

    addLeaveMutation(newLeave, {
      onSuccess: () => {
        setShowForm(false);
        setSelectedSingle(null);
        setRangeStart(null);
        setRangeEnd(null);
        setReason("");
        setOverlapError("");
      },
      onError: () => {
        setErrorMsg(addLeaveError?.data?.message);
      },
    });
  };

  const handleDelete = (id) => {
    deleteLeaveMutation(id, {
      onError: () => setErrorMsg(deleteLeaveError?.data?.message),
    });
  };

  const handleCancel = (id) => {
    cancelLeaveMutation(id, {
      onError: () => setErrorMsg(cancelLeaveError?.data?.message),
    });
  };

  /* ── filtered leaves ── */
  const filteredLeaves = leaves.filter((l) => {
    if (filterTab === "cancelled") return l.status === "cancelled";
    if (filterTab === "all") return true;
    if (filterTab === "upcoming")
      return l.status === "upcoming" || l.status === "active";
    if (filterTab === "ended") return l.status === "ended";
    return true;
  });

  const hasSelection =
    (mode === "single" && selectedSingle) ||
    (mode === "range" && rangeStart && rangeEnd);

  useEffect(() => {
    if (!isLoading && leavesData) {
      setLeaves(leavesData);
    }
  }, [isLoading, leavesData]);

  if (isLoading) return <PageLoader />;

  if (isError || !leavesData) {
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

      {/* ── PAGE HEADER ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-primary font-black text-xl sm:text-2xl">
          إدارة الإجازات
        </h1>
        <button
          onClick={() => {
            setShowForm((p) => !p);
            setOverlapError("");
          }}
          className="flex items-center gap-2 px-4 h-[38px] bg-primary/10 text-primary rounded-xl text-sm font-black hover:bg-primary hover:text-white transition-colors cursor-pointer border border-primary/20">
          <CalendarDays size={15} />
          إضافة إجازة
        </button>
      </div>

      {/* ── ADD FORM ── */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex flex-col gap-4">
            {/* MODE TOGGLE */}
            <div className="grid grid-cols-2 gap-2 bg-background-primary p-1 rounded-xl">
              {[
                { key: "single", label: "يوم واحد" },
                { key: "range", label: "فترة متعددة" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => {
                    setMode(m.key);
                    setSelectedSingle(null);
                    setRangeStart(null);
                    setRangeEnd(null);
                    setOverlapError("");
                  }}
                  className={`flex items-center justify-center gap-2 h-[40px] rounded-xl text-sm font-black transition-colors cursor-pointer ${
                    mode === m.key
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-400 hover:text-primary"
                  }`}>
                  <CalendarDays size={15} />
                  {m.label}
                </button>
              ))}
            </div>

            {/* RANGE DATE BADGES */}
            {mode === "range" && (rangeStart || rangeEnd) && (
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {rangeStart && (
                  <div className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold">
                    <CalendarDays size={14} />
                    {formatDateAr(rangeStart)}
                  </div>
                )}
                {rangeEnd && (
                  <>
                    <span className="text-gray-300">—</span>
                    <div className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold">
                      <CalendarDays size={14} />
                      {formatDateAr(rangeEnd)}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CALENDAR */}
            <div className="border border-gray-100 rounded-xl p-4">
              {/* nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  disabled={!canGoBack}
                  className="p-1.5 rounded-lg hover:bg-background-primary text-gray-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  <ChevronRight size={16} />
                </button>

                <span className="text-gray-700 font-black text-sm">
                  {MONTHS_AR[calMonth]}-{calYear}
                </span>
                <button
                  onClick={nextMonth}
                  disabled={!canGoFwd}
                  className="p-1.5 rounded-lg hover:bg-background-primary text-gray-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  <ChevronLeft size={16} />
                </button>
              </div>

              <Calendar
                year={calYear}
                month={calMonth}
                leaves={leaves}
                mode={mode}
                selectedSingle={selectedSingle}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onDayClick={handleDayClick}
              />
            </div>

            {/* REASON */}
            <div className="flex flex-col gap-1">
              <p className="text-primary text-sm font-semibold">سبب الإجازة</p>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="اكتب سبب الإجازة"
                className="w-full bg-background-primary rounded-xl px-4 py-3 text-sm text-gray-700 border border-transparent focus:outline-none focus:border-primary/30 resize-none placeholder:text-gray-300 transition-colors"
              />
            </div>

            {/* OVERLAP ERROR */}
            {overlapError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <X size={14} className="text-red-400 shrink-0" />
                <p className="text-red-500 text-sm">{overlapError}</p>
              </div>
            )}

            {/* INFO BANNER */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <Info size={15} className="text-blue-400 shrink-0" />
              <p className="text-blue-600 text-sm leading-relaxed">
                ستتوقف المواعيد تلقائياً وسوف يتم تأكيدها في هذا اليوم تم إعلام
                المرضى
              </p>
            </div>
          </div>

          {/* FORM FOOTER */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
            <button
              disabled={isAddingLeaveLoading || !reason || !hasSelection}
              onClick={handleSave}
              disabled={!hasSelection}
              className="flex items-center gap-2 px-5 h-[40px] bg-primary text-white rounded-xl text-sm font-black hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <Save size={14} />
              {isAddingLeaveLoading ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : (
                "إضافة إجازة"
              )}
            </button>
            <button
              disabled={isAddingLeaveLoading}
              onClick={() => {
                setShowForm(false);
                setSelectedSingle(null);
                setRangeStart(null);
                setRangeEnd(null);
                setReason("");
                setOverlapError("");
              }}
              className="flex items-center gap-2 px-5 h-[40px] border-2 border-gray-200 text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
              <X size={14} />
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* ── LEAVES LIST ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* filter tabs */}
          <div className="flex items-center gap-2">
            {[
              { key: "all", label: "الكل" },
              { key: "upcoming", label: "قادمة" },
              { key: "ended", label: "منتهية" },
              { key: "cancelled", label: "ملغاه" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setFilterTab(t.key)}
                className={`px-4 h-[34px] rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  filterTab === t.key
                    ? "bg-primary text-white"
                    : "border border-gray-200 text-gray-400 hover:border-primary hover:text-primary"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {filteredLeaves.length === 0 ? (
          <div className="bg-white rounded-2xl py-14 flex flex-col items-center gap-3 shadow-sm">
            <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center">
              <CalendarDays size={28} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-semibold text-sm">
              لا توجد إجازات
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeaves.map((leave) => (
              <LeaveCard
                key={leave._id}
                leave={leave}
                onDelete={handleDelete}
                onCancel={handleCancel}
                isLoading={isDeletingLeaveLoading || isCancellingLeaveLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
