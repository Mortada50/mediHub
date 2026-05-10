import React, { useEffect, useState } from "react";
import {
  Pencil,
  X,
  Check,
  MapPin,
  ChevronDown,
  AlertCircle,
  Navigation,
  CheckCircle,
  LoaderIcon,
} from "lucide-react";

import LocationPickerModal from "../components/LocationPickerModal";
import PageLoader from "../components/PageLoader.jsx";
import { yemenGovernorates } from "../utils/constant";

import { useProfile } from "../hooks/useProfile.js";
import TableErrorUI from "../components/TableErrorUi.jsx";
import InputsError from "../components/InputsError.jsx";
import ErrorUIDialog from "../components/ErrorUIDialog.jsx";

const INITIAL_CLINIC = {
  clinicName: "",
  phone: "",
  city: "",
  area: "",
  street: "",
  lat: null,
  lng: null,
};

const INITIAL_APPOINTMENTS = {
  price: "",
  sessionDuration: "",
};

const DURATIONS = [15, 20, 30, 45, 60];

/* ── reusable field ── */
const InfoField = ({
  label,
  value,
  name,
  isEditing,
  onChange,
  errors = {},
}) => (
  <div className="flex flex-col gap-1 flex-1 min-w-0">
    <p className="text-primary text-sm font-semibold px-1">{label}</p>
    {isEditing ? (
      <>
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="h-[46px] w-full bg-background-primary rounded-lg px-4 text-sm text-gray-700 border border-primary/20 focus:outline-none focus:border-primary/50 transition-colors"
        />
        {errors[name] && <InputsError error={errors[name]} />}
          
      </>
    ) : (
      <div className="h-[46px] w-full bg-background-primary rounded-lg px-4 flex items-center text-sm text-gray-700">
        {value || "—"}
      </div>
    )}
  </div>
);

/* ── section card wrapper ── */
const SectionCard = ({
  title,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  children,
  isLoading,
}) => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    {/* header */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <h2 className="text-dark font-black text-base">{title}</h2>
      {!isEditing && (
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 h-[34px] rounded-lg border-2 border-primary text-primary text-sm font-black hover:bg-primary hover:text-white transition-colors cursor-pointer">
          <Pencil size={13} />
          تغيير
        </button>
      )}
    </div>

    {/* body */}
    <div className="px-6 py-5 flex flex-col gap-4">{children}</div>

    {/* save / cancel */}
    {isEditing && (
      <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 h-[40px] bg-primary text-white rounded-xl text-sm font-black hover:bg-primary/90 transition-colors cursor-pointer">
         {isLoading ? (
          <LoaderIcon className="size-4 animate-spin" />
         ) : (
          <>
            <Check size={15} />
             حفظ التغييرات
          </>
         )}
         
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 h-[40px] border-2 border-gray-200 text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
          <X size={15} />
          إلغاء
        </button>
      </div>
    )}
  </div>
);

export default function ClinicSetting() {
  const {
    userProfile,
    isProfileLoading,
    isProfileError,
    profileError,
    refetch,
    isFetching,

    updateClinicMutation, 
    isUpdatingClinic,
    isClinicUpdateError,
    clinicUpdateError,

    updateAppointmentMutation,
    isUpdatingAppointment,
    isAppointmentUpdateError,
    appointmentUpdateError,

  } = useProfile(true);

  /* ── clinic state ── */
  const [clinic, setClinic] = useState(INITIAL_CLINIC);
  const [clinicDraft, setClinicDraft] = useState(INITIAL_CLINIC);
  const [editingClinic, setEditingClinic] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [openErrorUiDialog, setOpenErrorUiDialog] = useState(false);
  const [errors, setErrors] = useState({});

  const handleClinicChange = (e) => {
    const { name, value } = e.target;
    setClinicDraft((p) => ({ ...p, [name]: value }));
  };

  const validateClinicData = () => {
    const e = {};
    if (!clinicDraft.clinicName.trim()) e.clinicName = "يرجى إدخال اسم العيادة";
    if (!clinicDraft.city.trim()) e.city = "يرجى إدخال المدينة";
    if (!clinicDraft.area.trim()) e.area = "يرجى إدخال المديرية";
    if (!clinicDraft.street.trim()) e.street = "يرجى إدخال الشارع او الحي";
    if (!/^(?:\+967|00967)?(77|71|78|73)\d{7}$/.test(clinicDraft.phone))
      e.phone = "يرجى إدخال رقم هاتف صالح";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveClinic = () => {
    if (!validateClinicData()) return;

    setErrors({});
    setClinic(clinicDraft);
    updateClinicMutation(clinicDraft,{
      onSuccess: () => setEditingClinic(false),
      onError: () => setOpenErrorUiDialog(true)
    })
  };
  const cancelClinic = () => {
    setClinicDraft(clinic);
    setEditingClinic(false);
  };

  /* ── appointments state ── */
  const [appt, setAppt] = useState(INITIAL_APPOINTMENTS);
  const [apptDraft, setApptDraft] = useState(INITIAL_APPOINTMENTS);
  const [editingAppt, setEditingAppt] = useState(false);

  const saveAppt = () => {
    setAppt(apptDraft);

    updateAppointmentMutation(apptDraft, {
      onSuccess: () => setEditingAppt(false),
      onError: () => setOpenErrorUiDialog(true)
    })

  };
  const cancelAppt = () => {
    setApptDraft(appt);
    setEditingAppt(false);
  };

  useEffect(() => {
    if (!isProfileLoading) {
      const profile = userProfile?.profile;
      
      const initialClinic = {
        clinicName: profile?.clinicName,
        phone: profile?.phone,
        city: profile?.address?.city,
        area: profile?.address?.area,
        street: profile?.address?.street,
        lat: profile?.latLng?.lat || null,
        lng: profile?.latLng?.lng || null,
      };
      
      const initialAppointments = {
        price: profile?.appointmentFee,
        sessionDuration: profile?.appointmentDuration,
      };

      setClinicDraft(initialClinic);
      setClinic(initialClinic);

      setApptDraft(initialAppointments);
      setAppt(initialAppointments);
    }
  }, [userProfile, isProfileLoading]);

  if (isProfileLoading) return <PageLoader />;

  const currentClinic = editingClinic ? clinicDraft : clinic;
  const currentAppt = editingAppt ? apptDraft : appt;
  
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

  return (
    <>
      {(isAppointmentUpdateError || isClinicUpdateError) &&
        openErrorUiDialog && (
          <ErrorUIDialog
            title="حدث خطأ"
            message= {isAppointmentUpdateError ? "تعذر تحديث إعداد المواعيد" : "تعذر تحديث إعداد العيادة"}
            onClose={() => setOpenErrorUiDialog(false)}
            error={appointmentUpdateError || clinicUpdateError}
          />
        )}
      {showMapModal && (
        <LocationPickerModal
          savedLocation={{
            latLng:
              clinicDraft.lat && clinicDraft.lng
                ? {
                    lat: parseFloat(clinicDraft.lat),
                    lng: parseFloat(clinicDraft.lng),
                  }
                : null,
          }}
          onConfirm={(loc) =>
            setClinicDraft((p) => ({
              ...p,
              lat: loc.lat.toFixed(6),
              lng: loc.lng.toFixed(6),
            }))
          }
          onClose={() => setShowMapModal(false)}
        />
      )}
      <div className="flex flex-col gap-5 pb-8">
        {/* CLINIC INFORMATION */}
        <SectionCard
          title="معلومات العيادة"
          isEditing={editingClinic}
          onEdit={() => {
            setClinicDraft(clinic);
            setEditingClinic(true);
          }}
          onSave={saveClinic}
          onCancel={cancelClinic}
          isLoading={isUpdatingClinic}>
          {/* ROW 1: clinic name + phone */}
          <div className="flex flex-col sm:flex-row gap-4">
            <InfoField
              label="اسم العيادة"
              value={currentClinic.clinicName}
              name="clinicName"
              isEditing={editingClinic}
              onChange={handleClinicChange}
              errors={errors}
            />

            <InfoField
              label="رقم الهاتف"
              value={currentClinic.phone}
              name="phone"
              isEditing={editingClinic}
              onChange={handleClinicChange}
              errors={errors}
            />
          </div>

          {/* ROW 2: city + district + street */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className="text-primary text-sm font-semibold px-1">المدينة</p>
              <SelectDropdown
                value={clinicDraft.city}
                onChange={(city) => setClinicDraft({ ...clinicDraft, city })}
                options={yemenGovernorates}
                placeholder="اختر المدينة"
                isEditing={editingClinic}
              />
            </div>
            <InfoField
              label="المديرية"
              value={currentClinic.area}
              name="area"
              isEditing={editingClinic}
              onChange={handleClinicChange}
              errors={errors}
            />
            <InfoField
              label="الحي/الشارع"
              value={currentClinic.street}
              name="street"
              isEditing={editingClinic}
              onChange={handleClinicChange}
              errors={errors}
            />
          </div>

          {/* ROW 3: map location */}

          <div className="flex flex-col gap-1">
            <p className="text-primary text-sm font-semibold px-1">
              الموقع على الخريطة
            </p>

            {/* VIEW MODE */}
            {!editingClinic && (
              <div className="w-full bg-background-primary rounded-xl px-6 py-8 flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin size={16} className="text-primary" />
                  <span dir="ltr">
                    {currentClinic.lat && currentClinic.lng
                      ? `E${currentClinic.lng}  N,${currentClinic.lat}`
                      : "لم يتم تحديد الموقع بعد"}
                  </span>
                </div>
              </div>
            )}

            {/* EDIT MODE */}
            {editingClinic && (
              <div className="flex flex-col gap-3">
                {clinicDraft.lat && clinicDraft.lng && (
                  <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 w-fit">
                    <CheckCircle size={14} className="text-primary shrink-0" />
                    <span className="text-xs font-mono text-gray-600" dir="ltr">
                      Lat: {clinicDraft.lat} | Lng: {clinicDraft.lng}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="flex items-center justify-center gap-2 w-full h-[52px] border-2 border-dashed border-primary/30 rounded-xl text-primary text-sm font-semibold hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer bg-background-primary">
                  <Navigation size={16} />
                  {clinicDraft.lat
                    ? "تغيير الموقع على الخريطة"
                    : "تحديد الموقع على الخريطة"}
                </button>
              </div>
            )}
          </div>
        </SectionCard>

        {/* APPOINTMENT SETTING */}
        <SectionCard
          title="إعدادات المواعيد"
          isEditing={editingAppt}
          onEdit={() => {
            setApptDraft(appt);
            setEditingAppt(true);
          }}
          onSave={saveAppt}
          onCancel={cancelAppt}
          isLoading={isUpdatingAppointment}>
          {/* PRICE SLIDER */}
          <div className="flex flex-col gap-3">
            <p className="text-primary text-sm font-semibold px-1">
              سعر الحجز(1,000-10,000 ريال)
            </p>
            <div className="flex items-center gap-4">
              {/* slider */}
              <div className="flex-1 relative">
                <input
                  type="range"
                  min={1000}
                  max={10000}
                  step={500}
                  value={currentAppt.price}
                  disabled={!editingAppt}
                  onChange={(e) =>
                    setApptDraft((p) => ({
                      ...p,
                      price: Number(e.target.value),
                    }))
                  }
                  className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:cursor-default"
                  style={{
                    background: `linear-gradient(to left, var(--color-primary, #0d9488) ${
                      ((currentAppt.price - 1000) / 9000) * 100
                    }%, #e2f5f3 ${((currentAppt.price - 1000) / 9000) * 100}%)`,
                  }}
                />
              </div>
              {/* value label */}
              <span className="text-gray-500 text-sm font-semibold shrink-0 w-20 text-left">
                {currentAppt?.price?.toLocaleString()} ر.ي
              </span>
            </div>
          </div>

          {/* SESSION DURATION */}
          <div className="flex flex-col gap-3">
            <p className="text-primary text-sm font-semibold px-1">
              مدة الجلسة الواحدة(دقيقة)
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {DURATIONS.map((d) => {
                const isSelected = currentAppt.sessionDuration === d;
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={!editingAppt}
                    onClick={() =>
                      editingAppt &&
                      setApptDraft((p) => ({ ...p, sessionDuration: d }))
                    }
                    className={`flex-1 min-w-[60px] h-[48px] rounded-xl text-sm font-black border-2 transition-colors duration-150
                      ${
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : editingAppt
                            ? "border-gray-200 text-gray-500 hover:border-primary hover:text-primary cursor-pointer bg-white"
                            : "border-gray-200 text-gray-500 bg-white cursor-default"
                      }`}>
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

/* ── Select Dropdown ── */
function SelectDropdown({ value, onChange, options, placeholder, isEditing }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`relative h-[42px] bg-background-primary rounded-lg px-3 flex items-center justify-between cursor-pointer select-none border  focus-within:border-primary/50
           border-transparent`}
      onClick={() => setOpen((p) => !p)}>
      <span className={`text-sm ${value ? "text-primary" : "text-gray-300"}`}>
        {value || placeholder}
      </span>
      <ChevronDown
        size={14}
        className={`text-primary transition-transform shrink-0 ${open && isEditing ? "rotate-180" : ""}`}
      />
      {open && isEditing && (
        <div
          className="absolute z-30 top-[46px] left-0 right-0 bg-white shadow-lg border border-gray-100 rounded-xl p-1.5 max-h-[180px] overflow-y-auto no-scrollbar"
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
