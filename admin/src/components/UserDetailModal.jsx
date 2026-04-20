import {
  X,
  Mail,
  User,
  Venus,
  Stethoscope,
  BookOpen,
  Building2,
  Phone,
  MapPin,
  Map,
  Home,
  CheckCircle,
  XCircle,
  LoaderIcon,
} from "lucide-react";
import PageLoader from "./PageLoader";
import { useState } from "react";
import ErrorUIDialog from "./ErrorUIDialog";
/* ─────────────────────────────────────────── */
/*  INFO ROW                                   */
/* ─────────────────────────────────────────── */
const InfoRow = ({ label, value, dir = "rtl" }) => (
  <div className="flex flex-col items-start gap-0.5">
    <span className="text-primary text-sm font-semibold">{label}</span>
    <span className="text-gray-700 w-full bg-background-primary  rounded-md py-2 pr-2 text-sm font-normal" dir={dir}>
      {value || "—"}
    </span>
  </div>
);

/* ─────────────────────────────────────────── */
/*  USER DETAIL MODAL                          */
/* ─────────────────────────────────────────── */
export default function UserDetailModal({
  user,
  onClose,
  onApprove,
  isLoading,
  isError,
  Error,
  openErrorUiDialog,
  setOpenErrorUiDialog
}) {
  const [isPending, setIsPending] = useState({
    approve: false,
    reject: false
  });
  

  if (!user) return null;


  const isDoctor = user.role === "doctor";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={() => {
        if (!isLoading) {
          onClose();
        }
      }}>
      <div
        className="bg-background-primary rounded-2xl shadow-2xl w-full max-w-[950px] max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BTN */}
        <button
          disabled={isLoading}
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-10">
          <X size={18} />
        </button>

        <div className="flex flex-col sm:flex-row gap-2 relative p-4 pt-2">
          {/* ── RIGHT: INFO ── */}
          {isError && openErrorUiDialog ? (
              <ErrorUIDialog
                title="حدث خطأ"
                message="تعذر تحديث حالة المستخدم يرجى المحاولة لاحقا"
                onClose={setOpenErrorUiDialog}
                Error={Error}
              />
            ) : ("")}
          <div className="flex flex-col flex-1  gap-2 text-right">
            {/* ACCOUNT INFO */}
            <div className="bg-white rounded-md p-4">
              <p className="text-primary font-bold text-sm pb-2">
                معلومات الحساب
              </p>
              <div className="flex gap-4 items-center justify-start">
                {/* Avatar */}
                <div className="size-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      className="size-full object-cover"
                      alt=""
                    />
                  ) : (
                    <span className="text-primary font-black text-xl">
                      {user.fullName?.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 justify-start">
                    <span className="text-gray-600 text-md font-black">
                      {user.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-start">
                    <Mail size={14} className="text-primary" />
                    <span className="text-gray-500 text-xs" dir="ltr">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-start">
                    <User size={14} className="text-primary" />
                    <span className="text-gray-600 text-sm">
                      {isDoctor ? "حساب طبيب" : "حساب صيدلية"}
                    </span>
                  </div>
                  {user.gender && (
                    <div className="flex items-center gap-2 justify-start">
                      <Venus size={14} className="text-primary" />
                      <span className="text-gray-600 text-sm">
                        {user.gender}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PROFESSIONAL INFO */}
            {isDoctor ? (
              <div className="bg-white p-4 rounded-md">
                <p className="text-primary font-bold text-sm mb-3 pb-2">
                  المعلومات المهنية
                </p>
                <div className="flex flex-col gap-2.5">
                  <InfoRow label="التخصص الطبي" value={user.speciality} />
                  <InfoRow label="اسم العيادة" value={user.clinicName} />
                  <InfoRow
                    label="المؤهلات العلمية"
                    value={user.qualifications}
                  />
                  <InfoRow label="تلفون العيادة" value={user.phone} dir="ltr" />
                  <div className="flex gap-4 justify-start">
                    <div className="w-[50%]">
                      <InfoRow label="المديرية" value={user.address.area} />
                    </div>
                    <div className="w-[50%]">
                      <InfoRow label="المدينة" value={user.address.city} />
                    </div>
                  </div>
                  <InfoRow label="الحي / الشارع" value={user.address.street} />
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-md">
                <p className="text-primary font-bold text-sm mb-3 border-b border-gray-100 pb-2">
                  المعلومات الصيدلانية
                </p>
                <div className="flex flex-col gap-2.5">
                  <InfoRow
                    label="اسم الصيدلية"
                    value={user.pharmacyName || user.clinicName}
                  />

                  <InfoRow
                    label="تلفون الصيدلية"
                    value={user.phone}
                    dir="ltr"
                  />

                  <div className="flex gap-4 justify-between">
                    <div className="w-[50%]">
                      <InfoRow label="المدينة" value={user.address.city} />
                    </div>
                    <div className="w-[50%]">
                      <InfoRow label="المديرية" value={user.address.area} />
                    </div>
                  </div>
                  <InfoRow label="الحي / الشارع" value={user.address.street} />
                </div>
              </div>
            )}
          </div>

          {/* ── LEFT: LICENSE IMAGE ── */}
          <div className="flex flex-col flex-[2] p-5 border-b sm:border-b-0 sm:border-l border-gray-100 bg-white rounded-md">
            <p className="text-primary font-semibold text-sm text-right mb-3">
              صورة الترخيص الطبي
            </p>
            {user.license && (
              <a href={user.license} target="_blank" rel="noopener noreferrer">
                <img
                  src={user.license}
                  alt="license"
                  className="w-full md:w-[600px] md:h-[400px] rounded-xl object-contain border border-gray-100"
                />
              </a>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-background-primary rounded-b-2xl">
          <button
            disabled={isLoading}
            onClick={() => {
              onApprove(user._id, user.role, "active");
              setIsPending({ ...isLoading, approve: true });
            }}
            className="px-5 h-[40px] rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1.5">
            {isLoading && isPending.approve ? (
              <LoaderIcon className="size-7 animate-spin" />
            ) : (
              <>
                <CheckCircle size={15} />
                قبول
              </>
            )}
          </button>
          {user.status !== "rejected" && (
            <button
              disabled={isLoading}
              onClick={() => {
                onApprove(user._id, user.role, "rejected");
                setIsPending({ ...isPending, reject: true });
              }}
              className="px-5 h-[40px] rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer flex items-center gap-1.5">
              {isLoading && isPending.reject ? (
                <LoaderIcon className="size-7 animate-spin" />
              ) : (
                <>
                  <XCircle size={15} />
                  رفض
                </>
              )}
            </button>
          )}

          <button
            disabled={isLoading}
            onClick={onClose}
            className="px-5 h-[40px] rounded-lg border border-gray-300 text-gray-500 text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};