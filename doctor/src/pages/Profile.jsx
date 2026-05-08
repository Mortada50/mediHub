import React, { useState, useRef, useEffect } from "react";
import { Pencil, X, Check, Camera, User, Trash2, LoaderIcon } from "lucide-react";
import {useProfile} from "../hooks/useProfile.js"
import PageLoader from "../components/PageLoader.jsx";
import TableErrorUI from "../components/TableErrorUi.jsx";
import ErrorUIDialog from "../components/ErrorUIDialog.jsx";

/* ── mock data ── */
const INITIAL_DATA = {
  fullName: "د.أحمد محمد السلامي",
  email: "ahmedmohammed@gmial.com",
  gender: "ذكر",
  specialty: "أخصائي جراحة عامة",
  status: "نشط",
  bio: "أخصائي جراحة عامة يمتلك خبرة واسعة في تشخيص وعلاج الحالات الجراحية المختلفة، مع مهارة عالية في إجراء العمليات الدقيقة بأحدث التقنيات.\nيتميز بالدقة والالتزام برعاية المرضى.",
  experienceYears: "12",
  qualifications:
    "بكالوريوس في الطب والجراحة، مع إتمام سنة الامتياز والتدريب السريري في المستشفيات المعتمدة.حاصل على شهادة اختصاصبورد في الجراحة العامة.\nإضافة إلى دورات متقدمة في الجراحة الحديثة وتقنيات المناظير.",
  avatar: null,
};

/* ── reusable field components ── */
const InfoField = ({ label, value, isEditing, name, onChange, multiline }) => (
  <div className="flex flex-col gap-1 w-full">
    <p className="text-primary-400 text-md font-normal text-right px-1">
      {label}
    </p>
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
        <input
          readOnly={name === "specialty"}
          type={name === "experienceYears" ? "number" : "text"}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full h-[46px] bg-background-primary rounded-lg px-4 text-sm text-gray-700 border border-primary/20 focus:outline-none focus:border-primary/50 transition-colors text-right"
        />
      )
    ) : (
      <div className="w-full bg-background-primary rounded-lg px-4 py-3 text-sm text-gray-700 text-right whitespace-pre-line">
        {name === "experienceYears" ? `${value || "—"} سنوات` : value || "—"}
      </div>
    )}
  </div>
);

export default function Profile() {

  const {
    userProfile,
    isProfileLoading,
    isProfileError,
    profileError,
    refetch,
    isFetching,

    isUpdatingProfile,
    profileUpdateError,
    isProfileUpdateError,
    updateProfileMutation,
    profileUpdatedSuccess,

  } = useProfile(true);

  
  const [data, setData] = useState({});
  const [draft, setDraft] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [openErrorUiDialog, setOpenErrorUiDialog] = useState(false);
  const avatarRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((p) => ({ ...p, [name]: value }));
  };

  const handleEdit = () => {
    setDraft(data);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(data);
    setAvatarPreview(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    updateProfileMutation(
      {
        ...draft,
        avatarUrl: draft.avatar instanceof File ? null : draft.avatar,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
        onError: () => setOpenErrorUiDialog(true),
      },
    );

  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file))
      setDraft({...draft, avatar: file});
    }
    
    
  };
  

  const current = isEditing ? draft : data;
  
  const displayAvatar = avatarPreview || current.avatar;
  
  useEffect(() => {
    if (!isProfileLoading) {
      const profile = {
        fullName: userProfile?.profile?.fullName || "",
        email: userProfile?.profile?.email || "",
        gender: userProfile?.profile?.gender || "",
        speciality: userProfile?.profile?.speciality || "",
        status: userProfile?.status === "active" ? "نشط" : "موقوف",
        bio: userProfile?.profile?.bio || "",
        experienceYears: userProfile?.profile?.yearOfExperience || "",
        qualifications: userProfile?.profile?.qualifications || "",
        avatar: userProfile?.profile?.avatar || null,
      };

      setData(profile);
      setDraft(profile);
    }
  }, [userProfile, isProfileLoading ]);
    
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

  return (
    <>
      {isProfileUpdateError && openErrorUiDialog && (
        <ErrorUIDialog
          title="حدث خطأ"
          message="تعذر تحديث بياناتك"
          onClose={() => setOpenErrorUiDialog(false)}
          error={profileError}
        />
      )}

      <div className="flex flex-col gap-6 h-full pb-6">
        {/* ── CARD ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* ── HEADER SECTION ── */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h2 className="text-[#23404c] font-black text-lg mb-2">
                معلومات شخصية
              </h2>
              <div className="flex items-center gap-3">
                {!isEditing && (
                  <button
                    disabled={current.status === "موقوف"}
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 h-[36px] rounded-lg border-2 border-primary text-primary text-sm font-black hover:bg-primary hover:text-white transition-colors cursor-pointer">
                    <Pencil size={14} />
                    تغيير
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              {/* Left: avatar + name + badges */}
              <div className="flex items-center gap-5 flex-wrap justify-end">
                {/* AVATAR */}
                <div className="relative shrink-0">
                  <div className="size-[130px] rounded-full overflow-hidden bg-primary/10 border-4 border-white shadow-md flex items-center justify-center">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt="avatar"
                        className="size-full object-cover"
                      />
                    ) : (
                      <User size={36} className="text-primary/40" />
                    )}
                  </div>
                  {isEditing && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                        <div className="flex items-center justify-center rounded-full bg-background-primary/60 p-1">
                          <button
                            className="cursor-pointer"
                            onClick={() => avatarRef.current?.click()}>
                            <Camera size={20} className="text-primary" />
                          </button>
                        </div>
                        {displayAvatar && (
                          <div className="flex items-center justify-center rounded-full p-1  bg-[#ffe5e5]/50">
                            <button
                              onClick={() => {
                                setDraft({ ...draft, avatar: null });
                                setAvatarPreview(null);
                              }}
                              className="cursor-pointer">
                              <Trash2 size={20} className="text-[#b22f2f]" />
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
                <div className="flex flex-col items-start gap-2">
                  {/* Name */}
                  {isEditing ? (
                    <input
                      name="fullName"
                      value={draft.fullName}
                      onChange={handleChange}
                      className="h-[38px] bg-background-primary rounded-lg px-3 text-lg font-black text-primary border border-primary/20 focus:outline-none text-right w-[260px]"
                    />
                  ) : (
                    <h1 className="text-primary font-black text-2xl">
                      {current.fullName}
                    </h1>
                  )}

                  {/* Email */}

                  <p className="text-gray-400 text-sm" dir="ltr">
                    {current.email}
                  </p>

                  {/* BADGES */}
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* Specialty badge */}

                    <span className="px-3 py-1 rounded-full bg-[#dbeafe] text-[#1e40af] text-xs font-semibold">
                      {current.speciality}
                    </span>

                    {/* Gender */}

                    <span className="px-3 py-1 rounded-full bg-[#bcccdc] text-[#334e68] text-xs font-semibold">
                      {current.gender}
                    </span>

                    {/* Status */}
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${current.status === "نشط" ? "bg-[#d1fae5] text-[#059669]" : "bg-[#fee2e2] text-[#dc2626]"} text-xs font-semibold`}>
                      <span
                        className={`size-1.5 rounded-full ${current.status === "نشط" ? "bg-[#059669]" : "bg-[#dc2626]"}  inline-block`}
                      />
                      {current.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── FIELDS SECTION ── */}
          <div className="px-6 py-5 flex flex-col gap-5">
            {/* Full Name */}
            <InfoField
              label="الاسم الكامل"
              value={current.fullName}
              name="fullName"
              isEditing={isEditing}
              onChange={handleChange}
            />

            {/* Bio */}
            <InfoField
              label="النبذة الشخصية"
              value={current.bio}
              name="bio"
              isEditing={isEditing}
              onChange={handleChange}
              multiline
            />

            {/* Experience + Specialty */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1">
                <InfoField
                  label="سنوات الخبرة"
                  value={current.experienceYears}
                  name="experienceYears"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </div>
              <div className="flex-1">
                <InfoField
                  label="التخصص"
                  value={current.speciality}
                  name="specialty"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Qualifications */}
            <InfoField
              label="المؤهلات والشهادات"
              value={current.qualifications}
              name="qualifications"
              isEditing={isEditing}
              onChange={handleChange}
              multiline
            />
          </div>

          {/* ── EDIT ACTION BUTTONS ── */}
          {isEditing && (
            <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
              <button
                onClick={handleSave}
                disabled={isUpdatingProfile}
                className="flex items-center gap-2 px-6 h-[42px] bg-primary text-white rounded-xl text-sm font-black hover:bg-primary/90 transition-colors cursor-pointer">
                {isUpdatingProfile ? (
                  <LoaderIcon className="size-4 animate-spin" />
                ) : (
                  <>
                    <Check size={16} />
                    حفظ التغييرات
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdatingProfile}
                className="flex items-center gap-2 px-6 h-[42px] border-2 border-gray-200 text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
                <X size={16} />
                إلغاء
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
