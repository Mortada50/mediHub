import React, { useEffect, useState, useRef } from "react";
import {
  Pencil,
  X,
  Check,
  Camera,
  User,
  Trash2,
  LoaderIcon,
  MapPin,
  Navigation,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import LocationPickerModal from "../components/LocationPickerModal";
import { useProfile } from "../hooks/useProfile.js";
import PageLoader from "../components/PageLoader.jsx";
import TableErrorUI from "../components/TableErrorUi.jsx";
import ErrorUIDialog from "../components/ErrorUIDialog.jsx";
import InputsError from "../components/InputsError.jsx";
import { yemenGovernorates } from "../utils/constant";

/* ── reusable field ── */
const InfoField = ({
  label,
  value,
  isEditing,
  name,
  onChange,
  multiline,
  error,
  errors = {},
}) => (
  <div className="flex flex-col gap-1 w-full">
    <p className="text-primary text-sm font-semibold px-1">{label}</p>
    {isEditing ? (
      multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={4}
          className="w-full bg-background-primary rounded-lg px-4 py-3 text-sm text-gray-700 border border-primary/20 focus:outline-none focus:border-primary/50 transition-colors resize-none text-right"
        />
      ) : (
        <>
          <input
            type={name === "experienceYears" ? "number" : "text"}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full h-[46px] bg-background-primary rounded-lg px-4 text-sm text-gray-700 border ${
              error || errors[name] ? "border-red-500" : "border-primary/20"
            } focus:outline-none focus:border-primary/50 transition-colors text-right`}
          />
          {(error || errors[name]) && (
            <InputsError error={error || errors[name]} />
          )}
        </>
      )
    ) : (
      <div className="w-full bg-background-primary rounded-lg px-4 py-3 text-sm text-gray-700 text-right whitespace-pre-line min-h-[46px] flex items-center justify-start">
        {value || "—"}
      </div>
    )}
  </div>
);

/* ── Select Dropdown ── */
function SelectDropdown({ value, onChange, options, placeholder, isEditing }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative h-[46px] bg-background-primary rounded-lg px-4 flex items-center justify-between cursor-pointer select-none border border-primary/20"
      onClick={() => isEditing && setOpen((p) => !p)}>
      <span className={`text-sm ${value ? "text-gray-700" : "text-gray-300"}`}>
        {value || placeholder}
      </span>
      <ChevronDown
        size={14}
        className={`text-primary transition-transform shrink-0 ${open && isEditing ? "rotate-180" : ""}`}
      />
      {open && isEditing && (
        <div
          className="absolute z-30 top-[50px] left-0 right-0 bg-white shadow-lg border border-gray-100 rounded-xl p-1.5 max-h-[180px] overflow-y-auto no-scrollbar"
          onClick={(e) => e.stopPropagation()}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="w-full text-right text-sm text-gray-500 hover:bg-background-primary hover:text-primary px-3 py-2 rounded-lg transition-colors cursor-pointer">
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Section Card ── */
const SectionCard = ({
  title,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  children,
  isLoading,
  disableEdit,
}) => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <h2 className="text-dark font-black text-base">{title}</h2>
      {!isEditing && (
        <button
          disabled={disableEdit}
          onClick={onEdit}
          className="flex items-center gap-2 px-4 h-[36px] rounded-lg border-2 border-primary text-primary text-sm font-black hover:bg-primary hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <Pencil size={13} />
          تغيير
        </button>
      )}
    </div>
    <div className="px-6 py-5 flex flex-col gap-5">{children}</div>
    {isEditing && (
      <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 h-[42px] bg-primary text-white rounded-xl text-sm font-black hover:bg-primary/90 transition-colors cursor-pointer">
          {isLoading ? (
            <LoaderIcon className="size-4 animate-spin" />
          ) : (
            <>
              <Check size={16} /> حفظ التغييرات
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 h-[42px] border-2 border-gray-200 text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
          <X size={16} />
          إلغاء
        </button>
      </div>
    )}
  </div>
);

/* ═══════════════════════════════════════════════ */
export default function PharmacyInfoPage() {
  const {
    userProfile,
    isProfileLoading,
    isProfileError,
    profileError,
    refetch,
    isFetching,

    managerProfileUpdateMutation,
    isUpdatingManagerProfile,
    managerProfileUpdateError,
    isManagerProfileUpdatedError,

    pharmacyUpdateMutation,
    isUpdatingPharmacy,
    isPharmacyUpdatedError,
    pharmacyUpdateError

  } = useProfile(true);

  /* ── manager state ── */
  const [managerData, setManagerData] = useState({});
  const [managerDraft, setManagerDraft] = useState({});
  const [editingManager, setEditingManager] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [managerError, setManagerError] = useState("");
  const [openManagerErrorDialog, setOpenManagerErrorDialog] = useState(false);
  const avatarRef = useRef();

  /* ── pharmacy state ── */
  const [pharmacy, setPharmacy] = useState({
    pharmacyName: "",
    phone: "",
    bio: "",
    city: "",
    area: "",
    street: "",
    lat: null,
    lng: null,
  });
  const [pharmacyDraft, setPharmacyDraft] = useState({ ...pharmacy });
  const [editingPharmacy, setEditingPharmacy] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [pharmacyErrors, setPharmacyErrors] = useState({});
  const [openPharmacyErrorDialog, setOpenPharmacyErrorDialog] = useState(false);

  /* ── handlers: manager ── */
  const handleManagerChange = (e) => {
    const { name, value } = e.target;
    setManagerDraft((p) => ({ ...p, [name]: value }));
  };

  const saveManager = () => {
    setManagerError("");
    if (
      managerDraft.fullName.length < 6 ||
      managerDraft.fullName.split(" ").length < 3
    ) {
      setManagerError("يجب أن يكون الاسم ثلاثياً");
      return;
    }
    
    managerProfileUpdateMutation(
      {
        fullName: managerDraft.fullName,
        avatar: managerDraft.avatar,
        avatarUrl:
          managerDraft.avatar instanceof File ? null : managerDraft.avatar,
      },
      {
        onSuccess: () => setEditingManager(false),
        onError: () => setOpenManagerErrorDialog(true),
      },
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setManagerDraft((p) => ({ ...p, avatar: file }));
    }
  };

  const currentManager = editingManager ? managerDraft : managerData;
  
  
  const displayAvatar = avatarPreview || currentManager.avatar;

  /* ── handlers: pharmacy ── */
  const handlePharmacyChange = (e) => {
    const { name, value } = e.target;
    setPharmacyDraft((p) => ({ ...p, [name]: value }));
  };

  const validatePharmacy = () => {
    const e = {};
    if (!pharmacyDraft.pharmacyName?.trim())
      e.pharmacyName = "يرجى إدخال اسم الصيدلية";
    if (!pharmacyDraft.city?.trim()) e.city = "يرجى إدخال المدينة";
    if (!pharmacyDraft.area?.trim()) e.area = "يرجى إدخال المديرية";
    if (!pharmacyDraft.street?.trim()) e.street = "يرجى إدخال الحي/الشارع";
    if (!/^(?:\+967|00967)?(77|71|78|73)\d{7}$/.test(pharmacyDraft.phone))
      e.phone = "يرجى إدخال رقم هاتف صالح";
    setPharmacyErrors(e);
    return Object.keys(e).length === 0;
  };

  const savePharmacy = () => {
    if (!validatePharmacy()) return;
    setPharmacyErrors({});

    // shape the payload to match the Pharmacy model exactly:
    // address is a nested sub-document, location is GeoJSON [lng, lat]
    // const payload = {
    //   pharmacyName: pharmacyDraft.pharmacyName,
    //   phone: pharmacyDraft.phone,
    //   bio: pharmacyDraft.bio,
    //   address: {
    //     city: pharmacyDraft.city,
    //     area: pharmacyDraft.area,
    //     street: pharmacyDraft.street,
    //   },
    //   ...(pharmacyDraft.lat != null && pharmacyDraft.lng != null
    //     ? {
    //         location: {
    //           type: "Point",
    //           coordinates: [pharmacyDraft.lng, pharmacyDraft.lat],
    //         },
    //       }
    //     : {}),
    // };

    pharmacyUpdateMutation(pharmacyDraft, {
      onSuccess: () => setEditingPharmacy(false),
      onError: () => {
        setOpenPharmacyErrorDialog(true);
      },
    });
  };

  /* ── populate from API ── */
  useEffect(() => {
    if (!isProfileLoading && userProfile) {
      const profile = userProfile?.profile;

      const manager = {
        fullName: profile?.fullName || "",
        email: profile?.email || "",
        gender: profile?.gender || "",
        status: userProfile?.status === "active" ? "نشط" : "موقوف",
        avatar: profile?.avatar || null,
      };
      setManagerData(manager);
      setManagerDraft(manager);

      const pharm = {
        pharmacyName: profile?.pharmacyName ?? "",
        phone: profile?.phone ?? "",
        bio: profile?.bio ?? "",
        city: profile?.address?.city ?? "",
        area: profile?.address?.area ?? "",
        street: profile?.address?.street ?? "",
        // location is GeoJSON: { type: "Point", coordinates: [lng, lat] }
        lat: profile?.latLng?.lat ?? null,
        lng: profile?.latLng?.lng ?? null,
      };
      setPharmacy(pharm);
      setPharmacyDraft(pharm);
    }
  }, [userProfile, isProfileLoading]);

  if (isProfileLoading) return <PageLoader />;
  if (isProfileError || !userProfile) {
    return (
      <table className="flex items-center justify-center h-full">
        <tbody>
          <TableErrorUI
            message={profileError?.message}
            onRetry={() => refetch()}
            onloading={isFetching}
          />
        </tbody>
      </table>
    );
  }

  const currentPharmacy = editingPharmacy ? pharmacyDraft : pharmacy;
console.log(userProfile);
  return (
    <>
      {/* Error dialogs */}
      {isManagerProfileUpdatedError && openManagerErrorDialog && (
        <ErrorUIDialog
          title="حدث خطأ"
          message={
            managerProfileUpdateError?.message || "تعذر تحديث بيانات المسؤول"
          }
          onClose={() => setOpenManagerErrorDialog(false)}
          error={managerProfileUpdateError}
        />
      )}
      {isPharmacyUpdatedError && openPharmacyErrorDialog && (
        <ErrorUIDialog
          title="حدث خطأ"
          message={pharmacyUpdateError?.message || "تعذر تحديث بيانات الصيدلية"}
          onClose={() => setOpenPharmacyErrorDialog(false)}
          error={pharmacyUpdateError}
        />
      )}
      {showMapModal && (
        <LocationPickerModal
          savedLocation={{
            latLng:
              pharmacyDraft.lat && pharmacyDraft.lng
                ? {
                    lat: parseFloat(pharmacyDraft.lat),
                    lng: parseFloat(pharmacyDraft.lng),
                  }
                : null,
          }}
          onConfirm={(loc) =>
            setPharmacyDraft((p) => ({
              ...p,
              lat: Number(loc.lat.toFixed(6)),
              lng: Number(loc.lng.toFixed(6)),
            }))
          }
          onClose={() => setShowMapModal(false)}
        />
      )}

      <div className="flex flex-col gap-5 pb-8">
        {/* ══ MANAGER SECTION ══ */}
        <SectionCard
          title="معلومات المسؤول"
          isEditing={editingManager}
          onEdit={() => {
            setManagerDraft(managerData);
            setEditingManager(true);
          }}
          onSave={saveManager}
          onCancel={() => {
            setManagerDraft(managerData);
            setAvatarPreview(null);
            setEditingManager(false);
            setManagerError(null);
          }}
          isLoading={isUpdatingManagerProfile}
          disableEdit={currentManager.status === "موقوف"}>
          {/* Avatar + name + badges row */}
          <div className="flex items-start gap-5 flex-wrap justify-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="size-[100px] rounded-full overflow-hidden bg-primary/10 border-4 border-white shadow-md flex items-center justify-center">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="avatar"
                    className="size-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-primary/40" />
                )}
              </div>
              {editingManager && (
                <>
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-center rounded-full bg-background-primary/60 p-1">
                      <button
                        className="cursor-pointer"
                        onClick={() => avatarRef.current?.click()}>
                        <Camera size={18} className="text-primary" />
                      </button>
                    </div>
                    {displayAvatar && (
                      <div className="flex items-center justify-center rounded-full p-1 bg-[#ffe5e5]/50">
                        <button
                          onClick={() => {
                            setManagerDraft((p) => ({ ...p, avatar: null }));
                            setAvatarPreview(null);
                          }}
                          className="cursor-pointer">
                          <Trash2 size={18} className="text-[#b22f2f]" />
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={avatarRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col items-start gap-2 flex-1">
              {editingManager ? (
                <input
                  name="fullName"
                  value={managerDraft.fullName}
                  onChange={handleManagerChange}
                  className="h-[38px] bg-background-primary rounded-lg px-3 text-lg font-black text-primary border border-primary/20 focus:outline-none text-right w-[260px]"
                />
              ) : (
                <h1 className="text-primary font-black text-2xl">
                  {currentManager.fullName}
                </h1>
              )}
              {managerError && <InputsError error={managerError} />}
              <p className="text-gray-400 text-sm" dir="ltr">
                {currentManager.email}
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <span
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    currentManager.status === "نشط"
                      ? "bg-[#d1fae5] text-[#059669]"
                      : "bg-[#fee2e2] text-[#dc2626]"
                  }`}>
                  <span
                    className={`size-1.5 rounded-full inline-block ${currentManager.status === "نشط" ? "bg-[#059669]" : "bg-[#dc2626]"}`}
                  />
                  {currentManager.status}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#bcccdc] text-[#334e68] text-xs font-semibold">
                  {currentManager.gender}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ══ PHARMACY SECTION ══ */}
        <SectionCard
          title="معلومات الصيدلية"
          isEditing={editingPharmacy}
          onEdit={() => {
            setPharmacyDraft(pharmacy);
            setEditingPharmacy(true);
          }}
          onSave={savePharmacy}
          onCancel={() => {
            setPharmacyDraft(pharmacy);
            setPharmacyErrors({});
            setEditingPharmacy(false);
          }}
          isLoading={isUpdatingPharmacy}>
          {/* Row 1: name + phone */}
          <div className="flex flex-col sm:flex-row gap-5">
            <InfoField
              label="رقم الهاتف"
              value={currentPharmacy.phone}
              name="phone"
              isEditing={editingPharmacy}
              onChange={handlePharmacyChange}
              errors={pharmacyErrors}
            />
            <InfoField
              label="اسم الصيدلية"
              value={currentPharmacy.pharmacyName}
              name="pharmacyName"
              isEditing={editingPharmacy}
              onChange={handlePharmacyChange}
              errors={pharmacyErrors}
            />
          </div>

          {/* Bio */}
          <InfoField
            label="نبذة عن الصيدلية"
            value={currentPharmacy.bio}
            name="bio"
            isEditing={editingPharmacy}
            onChange={handlePharmacyChange}
            multiline
          />

          {/* Row 2: city + area + street */}
          <div className="flex flex-col sm:flex-row-reverse gap-5">
            <InfoField
              label="الحي/الشارع"
              value={currentPharmacy.street}
              name="street"
              isEditing={editingPharmacy}
              onChange={handlePharmacyChange}
              errors={pharmacyErrors}
            />
            <InfoField
              label="المديرية"
              value={currentPharmacy.area}
              name="area"
              isEditing={editingPharmacy}
              onChange={handlePharmacyChange}
              errors={pharmacyErrors}
            />
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-primary text-sm font-semibold px-1">المدينة</p>
              {editingPharmacy ? (
                <>
                  <SelectDropdown
                    value={pharmacyDraft.city}
                    onChange={(city) =>
                      setPharmacyDraft((p) => ({ ...p, city }))
                    }
                    options={yemenGovernorates}
                    placeholder="اختر المدينة"
                    isEditing={editingPharmacy}
                  />
                  {pharmacyErrors.city && (
                    <InputsError error={pharmacyErrors.city} />
                  )}
                </>
              ) : (
                <div className="w-full bg-background-primary rounded-lg px-4 py-3 text-sm text-gray-700 text-right min-h-[46px] flex items-center justify-end">
                  {currentPharmacy.city || "—"}
                </div>
              )}
            </div>
          </div>

          {/* ROW 3: map location */}

          <div className="flex flex-col gap-1">
            <p className="text-primary text-sm font-semibold px-1">
              الموقع على الخريطة
            </p>

            {/* VIEW MODE */}
            {!editingPharmacy && (
              <div className="w-full bg-background-primary rounded-xl px-6 py-8 flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin size={16} className="text-primary" />
                  <span dir="ltr">
                    {currentPharmacy.lat && currentPharmacy.lng
                      ? `E${currentPharmacy.lng}  N,${currentPharmacy.lat}`
                      : "لم يتم تحديد الموقع بعد"}
                  </span>
                </div>
              </div>
            )}

            {/* EDIT MODE */}
            {editingPharmacy && (
              <div className="flex flex-col gap-3">
                {pharmacyDraft.lat && pharmacyDraft.lng && (
                  <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 w-fit">
                    <CheckCircle size={14} className="text-primary shrink-0" />
                    <span className="text-xs font-mono text-gray-600" dir="ltr">
                      Lat: {pharmacyDraft.lat} | Lng: {pharmacyDraft.lng}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="flex items-center justify-center gap-2 w-full h-[52px] border-2 border-dashed border-primary/30 rounded-xl text-primary text-sm font-semibold hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer bg-background-primary">
                  <Navigation size={16} />
                  {pharmacyDraft.lat
                    ? "تغيير الموقع على الخريطة"
                    : "تحديد الموقع على الخريطة"}
                </button>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
