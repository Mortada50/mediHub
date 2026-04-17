import React, { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  LoaderIcon,
  Trash2,
  Pencil,
  User,
  Eye,
  EyeOff,
  Plus,
  Image,
  AlertCircle,
} from "lucide-react";
import loginLogo from "../assets/login-logo.png";
import Stepsbar from "../components/Stepsbar";
import InputsError from "../components/InputsError";

import { yemenGovernorates } from "../utils/constant.js";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";

// ----------------HOOKS---------------------
import { useProfile } from "../hooks/useProfile";
// -----------------API----------------------
import { uploadLicense } from "../services/api.js";
import PageLoader from "../components/PageLoader.jsx";

const INITIAL = {
  fullName: "",
  gender: "",
  email: "",
  password: "",
  confirmPassword: "",
  pharmacyName: "",
  phone: "",
  city: "",
  area: "",
  street: "",
  license: null,
};

function RegisterPage() {
  const location = useLocation();

  const update = location?.state?.update || false;
  //  this is for user resend data to backend if he rejected
  const {
    userProfile,
    isProfileError,
    profileError,
    isProfileLoading,
    isUpdatingProfile,
    profileUpdateMutation,
    profileUpdatedSuccess,
    profileUpdateError,
  } = useProfile(update);

  const [licensePreviewUrl, setLicensePreviewUrl] = useState(null);

  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL);

  const [loading, setLoading] = useState(false);
  const [error, setErrors] = useState({});

  const [verCode, setVerCode] = useState(["", "", "", "", "", ""]);
  const [showPass, setShowPass] = useState({
    newPassword: false,
    confirmNewPassword: false,
  });

  //  for removing image url from memory wen user change more than one image
  useEffect(() => {
    if (form.license) {
      const url =
        form.license instanceof File
          ? URL.createObjectURL(form.license)
          : form.license;

      setLicensePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLicensePreviewUrl(null);
    }
  }, [form.license]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const onChange = (e) => set(e.target.name, e.target.value);

  const STEPS = update
    ? ["الحساب", "بيانات الصيدلية"]
    : ["الحساب", "بيانات الصيدلية", "تأكيد الإيميل"];

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !verCode[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  // ── OTP Input Handler ──
  const handleOtp = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...verCode];
    next[i] = val.slice(-1);
    setVerCode(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthClass =
    strength <= 1
      ? { color: "text-red-600", msg: "كلمة مرور ضعيفة" }
      : strength <= 2
        ? { color: "text-orange-600", msg: "كلمة مرور متوسطة" }
        : { color: "text-green-600", msg: "كلمة مرور قوية" };

  // validation step 1
  const validateStep1 = () => {
    const e = {};
    if (
      !form.fullName.trim() ||
      form.fullName.trim().split(/\s+/).length < 3 ||
      form.fullName.length < 10
    )
      e.fullName = "الاسم يجب أن يكون ثلاثي";
    if (!form.gender) e.gender = "يرجى تحديد الجنس";
    if (!form.email.includes("@") && !update) e.email = "إيميل غير صالح";
    if (form.password.length < 8 && !update)
      e.password = "كلمة المرور 8 أحرف على الأقل";
    if (form.password !== form.confirmPassword && !update)
      e.confirmPassword = "كلمتا المرور غير متطابقتين";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // validateStep 2
  const validateStep2 = () => {
    const e = {};
    if (!form.pharmacyName.trim()) e.pharmacyName = "يرجى إدخال اسم الصيدلية";
    if (!form.city.trim()) e.city = "يرجى إدخال المدينة";
    if (!form.area.trim()) e.area = "يرجى إدخال المديرية";
    if (!form.street.trim()) e.street = "يرجى إدخال الشارع او الحي";
    if (!form.license) e.license = "يرجى رفع صورة الترخيص";
    if (!/^(?:\+967|00967)?(77|71|78|73)\d{7}$/.test(form.phone))
      e.phone = "يرجى إدخال رقم هاتف صالح";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // handle step 1
  const handleStep1 = () => {
    if (validateStep1()) setStep(2);
  };

  // handle step 2
  const handleStep2 = async () => {
    if (!validateStep2() || !isLoaded) return;
    setLoading(true);
    setErrors({});

    try {
      // 1. Upload the LicenseUrl to Cloudinary
      const licenseUrl =
        form.license instanceof File
          ? await uploadLicense(form.license)
          : form.license;

      if (!update) {
        await signUp.create({
          emailAddress: form.email,
          password: form.password,
        });

        // 3. save data in unsafeMetadata
        await signUp.update({
          unsafeMetadata: {
            role: "pharmacy",
            fullName: form.fullName,
            gender: form.gender,
            pharmacyName: form.pharmacyName,
            city: form.city,
            area: form.area,
            street: form.street,
            license: licenseUrl,
            phone: form.phone,
          },
        });

        // send virfication code
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        setStep(3);
      } else {
        profileUpdateMutation(
          { ...form, license: licenseUrl },
          { onSuccess: () => navigate("/pending-page") },
        );
      }
    } catch (err) {
      const e = {};
      const msg =
        err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message;
      const normalizedMsg = msg.toLowerCase();
      if (normalizedMsg?.includes("email"))
        e.email = "هذا البريد الإلكتروني مستخدم بالفعل";
      else if (
        normalizedMsg.includes("breach") ||
        normalizedMsg.includes("data breach")
      ) {
        e.password = "كلمة المرور هذه تم اختراقها سابقاً، استخدم كلمة مرور أخر";
      } else if (normalizedMsg.includes("password")) {
        e.password = "كلمة المرور غير صالحة";
      } else e.unKnown = "حدث خطأ، يرجى المحاولة مجدداً";
      console.log(normalizedMsg);

      setErrors(e);
      if (e.email || e.password) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // handle step 3
  const handleStep3 = async () => {
    setErrors({});

    if (!isLoaded) return;
    setLoading(true);

    try {
      const code = verCode.join("");
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({
          session: result.createdSessionId,
          redirectUrl: "/pending-page",
        });
      }
    } catch (err) {
      const e = {};
      const msg =
        err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "";
      const normalizedMsg = msg.toLowerCase();
      if (normalizedMsg.includes("expired")) e.code = "انتهت صلاحية كود التحقق";
      else if (
        normalizedMsg.includes("invalid") ||
        normalizedMsg.includes("incorrect")
      )
        e.code = "كود التحقق غير صالح";
      else e.unKnown = "حدث خطأ، يرجى المحاولة مجدداً";

      setErrors(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (update && userProfile?.profile) {
      const profile = userProfile?.profile;

      const INITIAL = {
        fullName: profile.fullName,
        gender: profile.gender,
        email: profile.email,
        password: "********",
        confirmPassword: "********",
        pharmacyName: profile.pharmacyName,
        phone: profile.phone,
        city: profile.address.city,
        area: profile.address.area,
        street: profile.address.street,
        license: profile.license,
      };
      setForm(INITIAL);
    }
  }, [update, userProfile]);

  // useEffect(() => {
  //   if (profileUpdatedSuccess) navigate("/pending-page");
  // }, [profileUpdatedSuccess, navigate]);

  if (update && isProfileLoading) return <PageLoader />;
  if (isProfileError) return <div>{profileError?.message}</div>;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* RIGHT SIDE - Form */}
      <div className="w-full lg:w-147 bg-white flex flex-col h-screen px-4 sm:px-8 lg:pr-16 lg:pl-5 py-6 lg:py-8">
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-10 bg-white pb-4 shrink-0">
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-primary font-black text-2xl sm:text-3xl lg:text-4xl">
              {update ? "تعديل بيانات الصيدلية''" : "تسجيل صيدلية''"}
            </h1>
            <p className="text-primary font-normal text-base lg:text-lg">
              أكمل بياناتك للحصول على موافقة الإدارة
            </p>
          </div>
          <Stepsbar steps={STEPS} current={step} />
          {error.unKnown && (
            <div className="bg-red-100 w-[368px] h-[55px] rounded-lg flex items-center px-3 mt-2">
              <AlertCircle className="size-[16px] text-red-600" />
              <span className="text-sm text-gray-600 mr-2">
                {error.unKnown}
              </span>
            </div>
          )}
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* ───────────── STEP 1 ───────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-2 items-start pt-5">
              {/* FULL NAME */}
              <div className="flex flex-col gap-1 w-full">
                <p className="mr-2 text-primary">اسم المسؤول</p>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={onChange}
                    placeholder="الاسم الثلاثي"
                    className={`h-[55px] w-full text-gray-700 -ml-1 bg-background-primary rounded-r-lg py-2 px-4 border focus:outline-none placeholder:text-sm ${
                      error.fullName ? "border-red-400" : "border-transparent"
                    }`}
                  />
                  <div className="flex items-center justify-center size-[55px] shrink-0 rounded-[8px] bg-primary">
                    <User className="size-[25px] text-white" />
                  </div>
                </div>
                {error.fullName && <InputsError error={error.fullName} />}
              </div>

              {/* GENDER */}
              <div className="flex flex-col gap-1 w-full">
                <p className="mr-2 text-primary">الجنس</p>
                <select
                  className={`h-[55px] w-full text-primary bg-background-primary rounded-lg py-2 px-4 border focus:outline-none placeholder:text-sm ${
                    error.gender ? "border-red-400" : "border-transparent"
                  }`}
                  name="gender"
                  value={form.gender}
                  onChange={onChange}>
                  <option value="" disabled>
                    اختر الجنس
                  </option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
                {error.gender && <InputsError error={error.gender} />}
              </div>

              {/* EMAIL */}
              <div className="flex flex-col gap-1 w-full">
                <p className="mr-2 text-primary">البريد الإلكتروني</p>
                <div className="flex items-center">
                  <input
                    readOnly={update}
                    type="email"
                    placeholder="البريد الإلكتروني"
                    className={`h-[55px] w-full -ml-1 text-gray-700 bg-background-primary rounded-r-lg py-2 px-4 border focus:outline-none placeholder:text-sm ${
                      error.email ? "border-red-400" : "border-transparent"
                    }`}
                    name="email"
                    value={form.email}
                    onChange={onChange}
                  />
                  <div className="flex items-center justify-center size-[55px] shrink-0 rounded-[8px] bg-primary">
                    <Mail className="size-[25px] text-white" />
                  </div>
                </div>
                {error.email && <InputsError error={error.email} />}
              </div>

              {/*  PASSWORD */}
              <div className="flex flex-col gap-1 w-full">
                <p className="mr-2 text-primary">كلمة المرور </p>
                <div className="flex items-center relative">
                  <input
                    readOnly={update}
                    type={showPass.newPassword ? "text" : "password"}
                    placeholder="كلمة المرور "
                    className={`h-[55px] w-full -ml-1 text-gray-700 border bg-background-primary rounded-r-lg py-2 px-4 focus:outline-none placeholder:text-sm ${
                      error.password ? "border-red-400" : "border-transparent"
                    }`}
                    name="password"
                    value={form.password}
                    onChange={(e) => {
                      setErrors({});
                      onChange(e);
                    }}
                  />
                  {showPass.newPassword ? (
                    <Eye
                      className="size-[20px] absolute left-[65px] z-40 text-primary cursor-pointer"
                      onClick={() =>
                        setShowPass({ ...showPass, newPassword: false })
                      }
                    />
                  ) : (
                    <EyeOff
                      className="size-[20px] absolute left-[65px] z-40 text-primary cursor-pointer"
                      onClick={() =>
                        setShowPass({ ...showPass, newPassword: true })
                      }
                    />
                  )}
                  <div className="flex items-center justify-center size-[55px] shrink-0 rounded-[8px] bg-primary">
                    <Lock className="size-[25px] text-white" />
                  </div>
                </div>
                <div
                  className={`flex-1 flex items-center ${error.password ? "justify-between" : "justify-end"} text-sm`}>
                  {!update && (error.password || strengthClass) ? (
                    <div className="text-sm mt-1 flex items-center justify-start gap-1 pr-1">
                      {error.password && (
                        <AlertCircle className="size-[16px] text-red-600" />
                      )}
                      <span
                        className={`text-sm ${error.password ? "text-gray-600" : strengthClass.color} `}>
                        {error.password
                          ? error.password
                          : form.password
                            ? strengthClass.msg
                            : ""}
                      </span>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="flex flex-col gap-1 w-full">
                <p className="mr-2 text-primary">تأكيد كلمة المرور الجديدة</p>
                <div className="flex items-center relative">
                  <input
                    readOnly={update}
                    type={showPass.confirmNewPassword ? "text" : "password"}
                    placeholder="تأكيد كلمة المرور الجديدة"
                    className={`h-[55px] w-full text-gray-700 -ml-1 border bg-background-primary rounded-r-lg py-2 px-4 focus:outline-none placeholder:text-sm ${
                      error.confirmPassword
                        ? "border-red-400"
                        : "border-transparent"
                    }`}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={onChange}
                  />
                  {showPass.confirmNewPassword ? (
                    <Eye
                      className="size-[20px] absolute left-[65px] z-40 text-primary cursor-pointer"
                      onClick={() =>
                        setShowPass({
                          ...showPass,
                          confirmNewPassword: false,
                        })
                      }
                    />
                  ) : (
                    <EyeOff
                      className="size-[20px] absolute left-[65px] z-40 text-primary cursor-pointer"
                      onClick={() =>
                        setShowPass({ ...showPass, confirmNewPassword: true })
                      }
                    />
                  )}
                  <div className="flex items-center justify-center size-[55px] shrink-0 rounded-[8px] bg-primary">
                    <Lock className="size-[25px] text-white" />
                  </div>
                </div>
                {error.confirmPassword && (
                  <InputsError error={error.confirmPassword} />
                )}
              </div>

              {/* NEXT BUTTON */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleStep1()}
                className="bg-primary mt-4 w-full text-white py-2 px-4 rounded-md cursor-pointer h-[50px] font-black text-lg flex items-center justify-center disabled:cursor-not-allowed">
                التالي
              </button>

              <div className="flex justify-center w-full pb-6">
                <p className="text-sm text-gray-600">
                  لديك حساب؟{" "}
                  <span
                    className="text-primary text-xs cursor-pointer"
                    onClick={() => navigate("/login")}>
                    اضغظ هنا
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* ───────────── STEP 2 ───────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-3 items-start pt-5 w-full">
              {/* اسم الصيدلية */}
              <div className="flex flex-col gap-1 w-full">
                <p className="mr-2 text-primary text-sm sm:text-base">
                  اسم الصيدلية
                </p>
                <input
                  name="pharmacyName"
                  value={form.pharmacyName}
                  onChange={onChange}
                  type="text"
                  placeholder="اسم الصيدلية"
                  className={`h-[55px] w-full bg-background-primary rounded-lg py-2 px-4 border focus:outline-none placeholder:text-sm text-gray-700 ${
                    error.pharmacyName ? "border-red-400" : "border-transparent"
                  }`}
                />
                {error.pharmacyName && (
                  <InputsError error={error.pharmacyName} />
                )}
              </div>

              {/* تلفون الصيدلية */}
              <div className="flex flex-col gap-1 w-full">
                <p className="mr-2 text-primary text-sm sm:text-base">
                  تلفون الصيدلية
                </p>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  type="text"
                  placeholder="تلفون الصيدلية"
                  className={`h-[55px] w-full bg-background-primary rounded-lg py-2 px-4 border focus:outline-none placeholder:text-sm text-gray-700 ${
                    error.phone ? "border-red-400" : "border-transparent"
                  }`}
                />
                {error.phone && <InputsError error={error.phone} />}
              </div>

              {/* CITY + DISTRICT  */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <div className="flex flex-col gap-1 flex-1">
                  <p className="mr-2 text-primary text-sm sm:text-base">
                    المدينة
                  </p>
                  <select
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    className={`h-[55px] w-full text-primary bg-background-primary rounded-lg py-2 px-4 border focus:outline-none text-sm ${
                      error.city ? "border-red-400" : "border-transparent"
                    }`}>
                    <option value="" disabled>
                      اختر المدينة
                    </option>
                    {yemenGovernorates.map((c, i) => (
                      <option key={i} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {error.city && <InputsError error={error.city} />}
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  <p className="mr-2 text-primary text-sm sm:text-base">
                    المديرية
                  </p>
                  <input
                    name="area"
                    value={form.area}
                    onChange={onChange}
                    type="text"
                    placeholder="المديرية"
                    className={`h-[55px] w-full bg-background-primary rounded-lg py-2 px-4 border focus:outline-none placeholder:text-sm text-gray-700 ${
                      error.area ? "border-red-400" : "border-transparent"
                    }`}
                  />
                  {error.area && <InputsError error={error.area} />}
                </div>
              </div>

              {/* STREET / AREA  */}
              <div className="flex flex-col gap-1 w-full">
                <p className="mr-2 text-primary text-sm sm:text-base">
                  الحي / الشارع
                </p>
                <input
                  name="street"
                  value={form.street}
                  onChange={onChange}
                  type="text"
                  placeholder="الحي / الشارع"
                  className={`h-[55px] w-full bg-background-primary rounded-lg py-2 px-4 border focus:outline-none placeholder:text-sm text-gray-700 ${
                    error.street ? "border-red-400" : "border-transparent"
                  }`}
                />
                {error.street && <InputsError error={error.street} />}
              </div>

              {/* LICENSE IMAGE*/}
              <div className="flex flex-col gap-1 w-full">
                <p className="mr-2 text-primary text-sm sm:text-base">
                  صورة الترخيص
                </p>

                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  id="licenseUpload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) set("license", file);
                  }}
                />

                {!form.license ? (
                  <label
                    htmlFor="licenseUpload"
                    className={`w-full min-h-[120px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors duration-200 hover:border-primary hover:bg-primary/5 ${
                      error.license
                        ? "border-red-400 bg-red-50"
                        : "border-primary/30 bg-background-primary"
                    }`}>
                    <div className="flex flex-col items-center gap-1 py-4">
                      <div className="relative">
                        <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Image className="size-6 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1 size-5 bg-primary rounded-full flex items-center justify-center">
                          <Plus className="size-3 text-white" />
                        </div>
                      </div>
                      <p className="text-primary text-sm font-medium">
                        اضغط للرفع
                      </p>
                      <p className="text-gray-400 text-xs">
                        JPG، PNG - حد أقصى 5MB
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="relative w-full rounded-xl overflow-hidden border-2 border-primary/20 group">
                    <img
                      src={licensePreviewUrl}
                      alt="license preview"
                      className="w-full max-h-[200px] object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                      {!loading && (
                        <label
                          htmlFor="licenseUpload"
                          className="flex items-center gap-1 bg-white text-primary text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer hover:bg-primary hover:text-white transition-colors duration-150">
                          <Pencil className="size-4" />
                          تغيير
                        </label>
                      )}
                      <button
                        disabled={loading || isUpdatingProfile}
                        type="button"
                        onClick={() => set("license", null)}
                        className="flex items-center gap-1 bg-white text-red-500 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors duration-150">
                        <Trash2 className="size-4" />
                        حذف
                      </button>
                    </div>
                  </div>
                )}

                {error.license && <InputsError error={error.license} />}
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 w-full mt-4">
                <button
                  type="submit"
                  disabled={loading || isUpdatingProfile}
                  onClick={() => setStep(1)}
                  className="flex-1 h-[50px] border-2 border-primary text-primary rounded-md font-black text-lg flex items-center justify-center hover:bg-primary/5 transition-colors duration-150 cursor-pointer">
                  السابق
                </button>
                <button
                  type="submit"
                  disabled={loading || isUpdatingProfile}
                  onClick={handleStep2}
                  className="flex-1 h-[50px] bg-primary text-white rounded-md font-black text-lg flex items-center justify-center disabled:cursor-not-allowed hover:bg-primary/90 transition-colors duration-150 cursor-pointer">
                  {loading || isUpdatingProfile ? (
                    <LoaderIcon className="size-7 animate-spin" />
                  ) : update ? (
                    "حفظ التغيرات"
                  ) : (
                    "إنشاء الحساب"
                  )}
                </button>
              </div>

              <div className="flex justify-center w-full pb-6">
                <p className="text-sm text-gray-600">
                  لديك حساب؟{" "}
                  <button
                    disabled={loading || isUpdatingProfile}
                    className="text-primary text-xs cursor-pointer"
                    onClick={() => navigate("/login")}>
                    اضغط هنا
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ───────────── STEP 3 ───────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-5 pt-5 w-full">
              {/* العنوان */}
              <h1 className="text-primary font-black text-2xl sm:text-3xl lg:text-4xl">
                تفقد بريدك الإلكتروني
              </h1>

              {/* تنبيه الإرسال */}
              <div className="bg-warning-background w-full h-[55px] rounded-lg flex items-center px-3">
                <AlertCircle className="size-[16px] text-text-warning-primary shrink-0" />
                <span className="text-sm text-text-warning-primary mr-2 truncate">
                  تم إرسال كود التحقق الى: {form.email}
                </span>
              </div>

              {/* OTP BOX */}
              <div className="w-full">
                <div className="w-full flex flex-col gap-3 px-4 pt-4 pb-6 items-center bg-background-primary rounded-xl">
                  <p className="text-xs text-gray-500">
                    ادخل الكود المكون من 6 ارقام
                  </p>

                  <div
                    className="flex items-center justify-center gap-1 sm:gap-2 w-full"
                    dir="ltr">
                    {verCode.map((val, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handleOtp(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        autoFocus={i === 0}
                        className={`
                            flex-1 min-w-0 max-w-[52px] aspect-square
                            text-center text-xl sm:text-2xl font-black text-primary
                            border rounded-[6px] outline-none
                            transition-colors duration-150
                            focus:border-primary
                            ${val ? "border-primary" : "border-gray-400"}
                          `}
                      />
                    ))}
                  </div>
                </div>

                {error.code && <InputsError error={error.code} />}
              </div>

              {/* زر التحقق */}
              <button
                type="submit"
                disabled={loading || verCode.some((v) => !v)}
                onClick={handleStep3}
                className="w-full h-[50px] bg-primary text-white rounded-md font-black text-lg flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 transition-opacity">
                {loading ? (
                  <LoaderIcon className="size-7 animate-spin" />
                ) : (
                  "التحقق من الكود"
                )}
              </button>

              {/* ROUTERING TO LOGIN OR RESEND VERIFICATION CODE  */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 pb-6">
                <p className="text-sm text-gray-500">
                  لم يصلك الكود؟{" "}
                  <button
                    disabled={loading}
                    className="text-primary text-xs font-normal cursor-pointer hover:underline"
                    onClick={() => {
                      setVerCode(["", "", "", "", "", ""]);
                      handleStep2();
                    }}>
                    أعد الارسال
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  لديك حساب؟{" "}
                  <button
                    disabled={loading}
                    onClick={() => navigate("/login")}
                    className="text-primary text-xs font-normal cursor-pointer hover:underline">
                    اضغط هنا
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
        {/* END SCROLLABLE CONTENT */}
      </div>

      {/* LEFT SIDE - Logo */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center rounded-r-xl">
        <img
          src={loginLogo}
          alt="Login Logo"
          className="w-[300px] xl:w-[500px]"
        />
      </div>
    </div>
  );
}

export default RegisterPage;
