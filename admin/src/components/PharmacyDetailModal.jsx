import {
  X,
  Mail,
  User,
  Mars,
  Venus,
  Calendar,
  Phone,
  Star,
  Clock,
  Users,
  BookOpen,
  Building2,
  MapPin,
  LoaderIcon,
  Ban,
  CheckCircle,
  Package
} from "lucide-react";
import FormatDate from "../utils/formatDate";

/* ── helpers ── */
const InfoRow = ({ label, value, dir = "rtl" }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-primary text-xs font-semibold">{label}</span>
    <span
      className="text-gray-600 bg-background-primary rounded-md py-1.5 px-2 text-sm"
      dir={dir}>
      {value || "—"}
    </span>
  </div>
);

const StatCard = ({ icon, label, value, sub }) => (
  <div className="flex flex-col gap-0.5 bg-background-primary rounded-xl px-3 py-2.5 flex-1 min-w-0">
    <div className="flex items-center gap-1.5 text-primary">
      {icon}
      <span className="text-xs text-gray-600">{label}</span>
    </div>
    <span className="text-primary font-black text-base">{value ?? "—"}</span>
    {sub && <span className="text-gray-600 text-xs">{sub}</span>}
  </div>
);

const DAY_LABELS = {
  saturday: "السبت",
  sunday: "الأحد",
  monday: "الإثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
};

/* ══════════════════════════════════════════════ */
export default function PharmacyDetailModal({
  pharmacy,
  onClose,
  onToggleStatus,
  isLoading = false,
}) {
  if (!pharmacy) return null;

  const isSuspended = pharmacy.status === "suspended";

  const handleAction = (action) => {
    onToggleStatus(pharmacy._id, pharmacy.role, action, pharmacy.fullName);
  };

  return (
    <div
      className="fixed inset-0 z-45 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={!isLoading && onClose}>
      <div
        className="bg-background-primary rounded-2xl shadow-2xl w-full max-w-[860px] max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}>
        {/* ── CLOSE ── */}
        <button
          onClick={!isLoading && onClose}
          className="absolute top-4 left-4 z-10 p-1.5 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
          <X size={17} />
        </button>

        <div className="flex flex-col lg:flex-row gap-3 p-4">
          {/* ════════════ RIGHT COLUMN ════════════ */}
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            {/* ACCOUNT INFO */}
            <div className="bg-white rounded-xl p-4">
              <p className="text-primary font-bold text-sm mb-3">
                معلومات الحساب
              </p>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="size-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/20">
                  {pharmacy.avatar ? (
                    <img
                      src={pharmacy.avatar}
                      className="size-full object-cover"
                      alt=""
                    />
                  ) : (
                    <span className="text-primary font-black text-2xl">
                      {pharmacy.fullName?.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-gray-900 font-black text-base truncate">
                      {pharmacy.fullName}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        isSuspended
                          ? "bg-red-100 text-red-500"
                          : "bg-[#daf5ca] text-[#005523]"
                      }`}>
                      {isSuspended ? "موقف" : "نشط"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={12} className="text-primary shrink-0" />
                    <span className="text-gray-400 text-xs truncate" dir="ltr">
                      {pharmacy.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {pharmacy.gender && (
                      <div className="flex items-center gap-1.5">
                        <Venus size={12} className="text-primary shrink-0" />
                        <span className="text-gray-500 text-xs">
                          {pharmacy.gender}
                        </span>
                      </div>
                    )}
                    {pharmacy.createdAt && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-primary shrink-0" />
                        <span className="text-gray-500 text-xs" dir="ltr">
                          {FormatDate(pharmacy.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="flex gap-2 mt-4 flex-wrap">
                <StatCard
                  icon={<Package size={13} />}
                  label="الادوية"
                  value={pharmacy.medicines?.length ?? "—"}
                  sub="دواء متوفر"
                />
                <StatCard
                  icon={<Star size={13} className="text-yellow-400" />}
                  label="التقييم"
                  // todo: add pharmacy.rating ??
                  value={"4.9"}
                />
                <StatCard
                  icon={<Clock size={13} />}
                  label="وقت الدوم"
                  value="8 ص - 12 م"
                />
              </div>
            </div>

            {/* PHARMACY INFO */}
            <div className="bg-white rounded-xl p-4">
              <p className="text-primary font-bold text-sm mb-3">
                بيانات الصيدلية
              </p>
              <div className="flex flex-col gap-2.5">
                <InfoRow label="اسم الصيدلية" value={pharmacy.pharmacyName} />
                <InfoRow
                  label="تلفون الصيدلية"
                  value={pharmacy.phone}
                  dir="ltr"
                />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <InfoRow label="المدينة" value={pharmacy.address?.city} />
                  </div>
                  <div className="flex-1">
                    <InfoRow label="المديرية" value={pharmacy.address?.area} />
                  </div>
                </div>
                <InfoRow
                  label="الحي / الشارع"
                  value={pharmacy.address?.street}
                />
              </div>
            </div>
          </div>

          {/* ════════════ LEFT COLUMN: LICENSE ════════════ */}
          <div className="flex flex-col gap-3 lg:w-[320px] shrink-0">
            {/* WORK DAYS */}
            <div className="bg-white rounded-xl p-4">
              <p className="text-primary font-bold text-sm mb-3">أيام العمل</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(DAY_LABELS).map(([key, label]) => (
                  <span
                    key={key}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      pharmacy.weeklySchedule?.includes(key)
                        ? "bg-primary text-white border-primary"
                        : "bg-background-primary text-gray-400 border-transparent"
                    }`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 flex flex-col gap-3 flex-1">
              <p className="text-primary font-semibold text-sm">صورة الترخيص</p>

              {pharmacy.license ? (
                <a
                  href={pharmacy.license}
                  target="_blank"
                  rel="noopener noreferrer">
                  <img
                    src={pharmacy.license}
                    alt="license"
                    className="w-full rounded-xl object-contain border border-gray-100 hover:opacity-90 transition-opacity"
                  />
                </a>
              ) : (
                "لا توجد صورة للترخيص"
              )}
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-white rounded-b-2xl">
          {isSuspended ? (
            <button
              disabled={isLoading}
              onClick={() => handleAction("active")}
              className="px-5 h-[40px] rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-70 flex items-center gap-2">
              {isLoading ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle size={15} /> تفعيل
                </>
              )}
            </button>
          ) : (
            <button
              disabled={isLoading}
              onClick={() => handleAction("suspended")}
              className="px-5 h-[40px] rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-70 flex items-center gap-2">
              {isLoading ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : (
                <>
                  <Ban size={15} /> توقيف
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 h-[40px] rounded-lg border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
