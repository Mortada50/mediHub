import React, { useState, useEffect } from "react";

import { useSignIn, useAuth } from "@clerk/clerk-react";


import { AlertCircle, ArrowRight, Mail, Lock, CheckIcon, Eye, EyeOff, LoaderIcon } from "lucide-react";
import { useNavigate } from "react-router";

import loginLogo from "../assets/login-logo.png";

function ForgetPasswordPage() {
  const {signIn, isLoaded} = useSignIn();
  const {signOut} = useAuth();
  
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState({
    newPassword: false,
    confirmNewPassword: false,
  })
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState({});
  const [verCode, setVerCode] = useState(["", "", "", "", "", ""]);
  
  const navigate = useNavigate();

  useEffect(() => {
    if(localStorage.getItem("url") === "/forget-password") {
      localStorage.removeItem("url");
      setStep(4);
    }
  }, [])

  // ── OTP Input Handler ──
  const handleOtp = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...verCode];
    next[i] = val.slice(-1);
    setVerCode(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !verCode[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };


  const validateStep3 = () => {
    const e = {};
    if (password.length < 8) e.password = "كلمة المرور 8 أحرف على الأقل";
    if (password !== confirmPassword)
      e.confirmPassword = "كلمتا المرور غير متطابقتين";
    setError(e);

    return Object.keys(e).length === 0;
  };
  const validateStep1 = () => {
    const e = {};

    if (!email || !email.trim()) {
      e.email = "الإيميل مطلوب";
    } else if (!email.includes("@")) {
      e.email = "إيميل غير صالح";
    }
    setError(e);

    return Object.keys(e).length === 0;
  };

  const passwordStrength = () => {
    const p = password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++ ;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const strength = passwordStrength();
  const strengthClass =
    strength <= 1
      ? {color: "text-red-600" , msg:"كلمة مرور ضعيفة"}
      : strength <= 2
        ? {color: "text-orange-600", msg:"كلمة مرور متوسطة"}
        : {color: "text-green-600", msg:"كلمة مرور قوية"};


  const handleStep1 = async () => {
    
    setError({});

    if(!isLoaded) return;

    setLoading(true);

    if(!validateStep1()) {
      setLoading(false);
      return ;
    }

    try {

      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setStep(2);
    } catch (err) {

       const e = {};
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message;
      if (msg?.includes("account")) e.email = "البريد الإلكتروني غير موجود";
      else if (msg?.includes("Identifier"))
        e.email = "البريد الإلكتروني غير صالح";
      
      else e.unKnown = "حدث خطأ، يرجى المحاولة مجدداً";

      setError(e);

    }finally{
      setLoading(false)
    }



  };

  const handleStep2 = async () => {
      setError({});

     if(!isLoaded) return;

     setLoading(true);
      const code = verCode.join("");
      
     try {
      const result = await signIn.attemptFirstFactor({
      strategy: "reset_password_email_code",
      code: code,
    });
    if (result.status === "needs_new_password") setStep(3);
     } catch (err) {
      const e = {};
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message;
      if(msg.includes("expired")) e.code = "انتهت صلاحية كود التحقق";
      else if(msg.includes("Invalid") || msg.includes("Incorrect")) e.code = "كود التحقق غير صالح";
      else e.unKnown = "حدث خطأ، يرجى المحاولة مجدداً";
    
      setError(e) 
      
     }finally{
      setLoading(false); 
     }
  };

  const handleStep3 = async () => {

     setError({});

    if(!isLoaded) return;

    setLoading(true);

    if(!validateStep3()) {
      setLoading(false);
      return ;
    }

    try {
      
     const result = await signIn.resetPassword({
        password: password,
      });
      
      
      if(result.status === "complete"){
        
        localStorage.setItem("url", "/forget-password");
        await signOut()
        
      }

      
    } catch (err) {
      const e = {};
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message;
     if (
       msg.toLowerCase().includes("breach") ||
       msg.toLowerCase().includes("data breach")
     ) {
       e.password = "كلمة المرور هذه تم اختراقها سابقاً، استخدم كلمة مرور أخر";
     } else if (msg.toLowerCase().includes("password")) {
       e.password = "كلمة المرور غير صالحة";
     } else {
       e.unKnown = "حدث خطأ، يرجى المحاولة مجدداً";
     }
     console.log(err);
     
      
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* RIGHT SIDE */}
      <div className="w-147 bg-white flex-1 flex flex-col p-[50px] gap-6">
        {/* HEADER */}
        {step !== 4 && (
          <div className="size-[42px] rounded-full bg-primary flex items-center justify-center">
            <ArrowRight
              className="size-[20px] text-white"
              onClick={() => navigate("/login")}
            />
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="flex flex-col gap-2 ">
              <h1 className="text-primary font-black text-4xl">
                نسيت كلمة المرور
              </h1>
              <p className="text-primary">
                أدخل بريدك الإلكتروني لتغير كلمة المرور
              </p>
            </div>

            {/* EMAIL INPUT + SEND BTN */}
            <div className="flex flex-col gap-1">
              <p className="mr-2 text-primary">البريد الإلكتروني</p>
              <div className="flex items-center">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className={`h-[55px] w-[368px] -ml-1 bg-background-primary rounded-r-lg py-2 px-4 border focus:outline-none placeholder:text-sm ${false ? "border-red-400" : "border-transparent"}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="flex items-center justify-center size-[55px] rounded-[8px] bg-primary">
                  <Mail className="size-[25px] text-white" />
                </div>
              </div>
              {error.email && (
                <div className="text-sm mt-1 flex items-center justify-start gap-1 pr-1">
                  <AlertCircle className="size-[16px] text-red-600" />
                  <span className="text-sm text-gray-600">{error.email}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              onClick={() => handleStep1()}
              className="bg-primary sm:w-auto min-w-[150px] max-w-[422px] text-white py-2 px-4 rounded-md cursor-pointer h-[50px] font-black text-lg flex items-center justify-center disabled:cursor-not-allowed">
              {loading ? (
                <LoaderIcon className="size-7 animate-spin" />
              ) : (
                "دخول"
              )}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="flex flex-col gap-5">
              <h1 className="text-primary font-black text-4xl">
                تفقد بريدك الإلكتروني
              </h1>

              <div className="bg-warning-primary w-full md:w-[368px] h-[55px] rounded-lg flex items-center px-3 mt-2">
                <AlertCircle className="size-[16px] text-yellow-600" />
                <span className="text-sm text-gray-600 mr-2">
                  تم إرسال كود التحقق الى: {email ? email : "mortada@gmail.com"}
                </span>
              </div>
              <div>
                <div className="w-full md:w-[368px] flex flex-col gap-2 px-2 pt-3 pb-5 items-center bg-background-primary rounded-md">
                  <p className="text-xs text-gray-500">
                    ادخل الكود المكون من 6 ارقام
                  </p>
                  <div className="felx justify-center">
                    {verCode.map((val, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        className={`text-primary size-[26px]  text-2xl md:size-[52px] ml-1 text-center font-black border border-gray-500  focus:border-primary  rounded-[6px] outline-0 transition-colors ${val ? "border-primary" : ""}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handleOtp(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>
                {error.code && (
                  <div className="text-sm mt-1 flex items-center justify-start gap-1 pr-1">
                    <AlertCircle className="size-[16px] text-red-600" />
                    <span className="text-sm text-gray-600">الكود خطاء</span>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || verCode.some((v) => !v)}
                onClick={() => handleStep2()}
                className="bg-primary w-full md:w-[368px] text-white py-2 px-4 rounded-md cursor-pointer h-[50px] font-black text-lg flex items-center justify-center disabled:cursor-not-allowed">
                {loading ? (
                  <LoaderIcon className="size-7 animate-spin" />
                ) : (
                  "التحقق من الكود"
                )}
              </button>
              <div className="flex justify-center items-centr">
                {/* TODO: CHECK THIS OUT (if the user cleck resend so many time ?) */}
                <p className="font-normal text-sm text-gray-500">
                  لم يصلك الكود؟{" "}
                  <span
                    className="text-primary text-xs font-normal cursor-pointer"
                    onClick={() => handleStep1()}>
                    أعد الارسال
                  </span>
                </p>
              </div>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            {/* HEADER */}
            <div className="flex flex-col gap-2">
              <h1 className="text-primary font-black text-4xl">
                تعين كلمة مرور جديدة
              </h1>
              <p className="text-primary">
                أدخل كلمة المرور الجديدة لتتمكن من تسجيل الدخول
              </p>
            </div>

            {/* BODEY */}
            {/* NEW PASSWORD */}
            <div className="flex flex-col gap-1">
              <p className="mr-2 text-primary">كلمة المرور الجديدة</p>
              <div className="flex items-center relative">
                <input
                  type={showPass.newPassword ? "text" : "password"}
                  placeholder="كلمة المرور الجديدة"
                  className={`h-[55px] w-full md:w-[368px] -ml-1 border bg-background-primary rounded-r-lg py-2 px-4 focus:outline-none placeholder:text-sm ${error.password ? "border-red-400" : "border-transparent"}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError({})
                  }}
                />
                {showPass.newPassword ? (
                  <Eye
                    className="size-[20px] absolute left-[65px] z-40 text-primary"
                    onClick={() =>
                      setShowPass({ ...showPass, newPassword: false })
                    }
                  />
                ) : (
                  <EyeOff
                    className="size-[20px] absolute left-[65px] z-40 text-primary"
                    onClick={() =>
                      setShowPass({ ...showPass, newPassword: true })
                    }
                  />
                )}
                <div className="flex items-center justify-center size-[55px] rounded-[8px] bg-primary">
                  <Lock className="size-[25px text-white" />
                </div>
              </div>

              <div
                className={`flex-1 flex items-center ${error.password ? "justify-between" : "justify-end"} text-sm`}>
                {error.password ||
                  (strengthClass && (
                    <div className="text-sm mt-1 flex items-center justify-start gap-1 pr-1">
                      {error.password && (
                        <AlertCircle className="size-[16px] text-red-600" />
                      )}
                      <span
                        className={`text-sm ${error.password ? "text-gray-600" : strengthClass.color} `}>
                        {error.password
                          ? error.password
                          : password
                            ? strengthClass.msg
                            : ""}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* CONFIRM NEW PASSWORD */}
            <div className="flex flex-col gap-1">
              <p className="mr-2 text-primary">تأكيد كلمة المرور الجديدة</p>
              <div className="flex items-center relative">
                <input
                  type={showPass.confirmNewPassword ? "text" : "password"}
                  placeholder="تأكيد كلمة المرور الجديدة"
                  className={`h-[55px] w-full  md:w-[368px] -ml-1 border bg-background-primary rounded-r-lg py-2 px-4 focus:outline-none placeholder:text-sm ${error.password ? "border-red-400" : "border-transparent"}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {showPass.confirmNewPassword ? (
                  <Eye
                    className="size-[20px] absolute left-[65px] z-40 text-primary"
                    onClick={() =>
                      setShowPass({ ...showPass, confirmNewPassword: false })
                    }
                  />
                ) : (
                  <EyeOff
                    className="size-[20px] absolute left-[65px] z-40 text-primary"
                    onClick={() =>
                      setShowPass({ ...showPass, confirmNewPassword: true })
                    }
                  />
                )}
                <div className="flex items-center justify-center size-[55px] rounded-[8px] bg-primary">
                  <Lock className="size-[25px] text-white" />
                </div>
              </div>

              <div
                className={`flex-1 flex items-center ${error.confirmPassword ? "justify-between" : "justify-end"} text-sm`}>
                {error.confirmPassword && (
                  <div className="text-sm mt-1 flex items-center justify-start gap-1 pr-1">
                    <AlertCircle className="size-[16px] text-red-600" />
                    <span className="text-sm text-gray-600">
                      {error.confirmPassword}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              onClick={() => handleStep3()}
              className="bg-primary w-full md:w-[422px] text-white py-2 px-4 rounded-md cursor-pointer h-[50px] font-black text-lg flex items-center justify-center disabled:cursor-not-allowed">
              {loading ? (
                <LoaderIcon className="size-7 animate-spin" />
              ) : (
                "تحديث كلمة المرور"
              )}
            </button>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="flex-1 flex justify-center items-center">
            <div className="flex flex-col justify-center items-center">
              <div className="flex justify-center items-center md:size-[100px] rounded-full bg-primary">
                <CheckIcon className="md:size-[50px] text-white" />
              </div>
              <h1 className="text-xl font-bold text-primary mt-5">
                تم تحديث كلمة المرور بنجاح
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                العودة لتسجيل الدخول؟
                <span
                  className="text-primary text-xs font-normal cursor-pointer"
                  onClick={() => {
                    navigate("/login")
                    }}>
                  إضغط هنا
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* LEFT SIDE */}
      <div className="hidden md:hidden lg:flex w-213 bg-primary  items-center justify-center rounded-r-xl">
        <img src={loginLogo} alt="Login Logo" className="size-[500px]" />
      </div>
    </div>
  );
}

export default ForgetPasswordPage;




