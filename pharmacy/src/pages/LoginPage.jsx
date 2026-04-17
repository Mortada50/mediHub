import React from "react";
import { Mail, Lock, LoaderIcon, AlertCircle } from "lucide-react";
import loginLogo from "../assets/login-logo.png";
import { useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});

  const { signIn, isLoaded, setActive } = useSignIn();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email || !email.trim()) {
      e.email = "الإيميل مطلوب";
    } else if (!email.includes("@")) {
      e.email = "إيميل غير صالح";
    }
    if (!password) {
      e.password = "كلمة المرور مطلوبة";
    }
    setError(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError({});
    setLoading(true);
    if (!validate()) {
      setLoading(false);
      return;
    }
    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/dashboard");
      }
    } catch (err) {
      const e = {};
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message;
      if (msg?.includes("account")) e.email = "البريد الإلكتروني غير موجود";
      else if (msg?.includes("Identifier"))
        e.email = "البريد الإلكتروني غير صالح";
      else if (msg?.includes("Password")) e.password = "كلمة المرور غير صحيحة";
      else e.unKnown = "حدث خطأ، يرجى المحاولة مجدداً";
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* RIGHT SIDE - Form */}
      <div className="w-full lg:w-147 bg-white flex flex-col items-center justify-center px-4 sm:px-8 lg:px-16 py-10 lg:py-0">
        {/* HEADER */}
        <div className="flex flex-col items-center gap-2 mb-6 sm:mb-8">
          <h1 className="text-primary font-black text-2xl sm:text-3xl lg:text-4xl">
            مرحبا بعودتك
          </h1>
          <p className="text-primary text-sm sm:text-base">
            سجل الان الى حسابك
          </p>
        </div>

        {/* UNKNOWN ERROR */}
        {error.unKnown && (
          <div className="bg-red-100 w-full max-w-[422px] h-[55px] rounded-lg flex items-center px-3 mb-4">
            <AlertCircle className="size-[16px] text-red-600 shrink-0" />
            <span className="text-sm text-gray-600 mr-2">{error.unKnown}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <div className="flex flex-col gap-5 w-full max-w-[422px]">
          {/* EMAIL */}
          <div className="flex flex-col gap-1">
            <p className="mr-2 text-primary text-sm sm:text-base">
              البريد الإلكتروني
            </p>
            <div className="flex items-center">
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className={`h-[55px] w-full -ml-1 bg-background-primary rounded-r-lg py-2 px-4 border focus:outline-none placeholder:text-sm ${
                  error.email ? "border-red-400" : "border-transparent"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="flex items-center justify-center size-[55px] shrink-0 rounded-[8px] bg-primary">
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

          {/* PASSWORD */}
          <div className="flex flex-col gap-1">
            <p className="mr-2 text-primary text-sm sm:text-base">
              كلمة المرور
            </p>
            <div className="flex items-center">
              <input
                type="password"
                placeholder="كلمة المرور"
                className={`h-[55px] w-full -ml-1 border bg-background-primary rounded-r-lg py-2 px-4 focus:outline-none placeholder:text-sm ${
                  error.password ? "border-red-400" : "border-transparent"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex items-center justify-center size-[55px] shrink-0 rounded-[8px] bg-primary">
                <Lock className="size-[25px] text-white" />
              </div>
            </div>
            <div
              className={`flex-1 flex items-center ${
                error.password ? "justify-between" : "justify-end"
              } text-sm`}>
              {error.password && (
                <div className="text-sm mt-1 flex items-center justify-start gap-1 pr-1">
                  <AlertCircle className="size-[16px] text-red-600" />
                  <span className="text-sm text-gray-600">
                    {error.password}
                  </span>
                </div>
              )}
              <button
                disabled={loading}
                type="button"
                className="cursor-pointer text-primary hover:underline text-sm"
                onClick={() => navigate("/forget-password")}>
                نسيت كلمة المرور؟
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="button"
            disabled={loading}
            onClick={handleLogin}
            className="bg-primary w-full text-white py-2 px-4 rounded-md cursor-pointer h-[50px] font-black text-lg flex items-center justify-center disabled:cursor-not-allowed">
            {loading ? <LoaderIcon className="size-7 animate-spin" /> : "دخول"}
          </button>
          <div className="flex flex-col gap-5 py-4">
            <div className="flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm font-light">
                أو
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => navigate("/doctor-registration")}
              className="bg-white w-full text-primary py-2 px-4 rounded-md cursor-pointer h-[50px] font-black text-lg flex items-center justify-center disabled:cursor-not-allowed border border-primary hover:bg-primary hover:text-white ">
              سجل الان
            </button>
          </div>
        </div>
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

export default LoginPage;
