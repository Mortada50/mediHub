import React from 'react'

import {Mail, Lock, LoaderIcon, AlertCircle} from "lucide-react";

import loginLogo from '../assets/login-logo.png'

import { useSignIn } from '@clerk/clerk-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});


  const {signIn, isLoaded, setActive} = useSignIn();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    
    if (!email || !email.trim()){
       e.email = "الإيميل مطلوب";
      } else if (!email.includes("@")){ 
        e.email = "إيميل غير صالح";
      }else if (!password) e.password = "كلمة المرور مطلوبة";

    setError(e);

    return Object.keys(e).length === 0;
  };

  const  handleLogin = async (e) => {
    e.preventDefault();

    if (!isLoaded) return;
    setError({});
    setLoading(true);

    if(!validate()) {
      setLoading(false);
      return;
    } ;
    try {
      const result = await signIn.create({
        identifier: email,
        password: password
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/dashboard");
      }

    } catch (err) {
      const e = {};
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message;
       if ( msg?.includes("account") ) e.email = "البريد الإلكتروني غير موجود";
       else if (msg?.includes("Identifier")) e.email = "البريد الإلكتروني غير صالح";
     else if (msg?.includes("Password")) e.password = "كلمة المرور غير صحيحة";
      else e.unKnown = "حدث خطأ، يرجى المحاولة مجدداً";

     setError(e);
     
     
      
    }finally {
      setLoading(false);
    }
  };

  
  

  return (
    <div className="flex min-h-screen">
      {/* RIGHT SIDE */}
      <div className="w-147 bg-white felx-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-primary font-black text-4xl">مرحبا بعودتك''</h1>
          <p className="text-primary">سجل الان الى حسابك</p>
        </div>

        {error.unKnown && <div className='bg-red-100 w-[368] h-[55px] rounded-lg flex items-center px-3 mt-2'>
          <AlertCircle className="size-[16px] text-red-600" />
          <span className="text-sm text-gray-600 mr-2">{error.unKnown}</span>
        </div>}

        {/* LOGIN FORM */}
        <div className="flex flex-col gap-5 mt-8">
          <div className="flex flex-col gap-1">
            <p className="mr-2 text-primary">البريد الإلكتروني</p>
            <div className="flex items-center">
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className={`h-[55px] w-[368px] -ml-1 bg-background-primary rounded-r-lg py-2 px-4 border focus:outline-none placeholder:text-sm ${error.email ? "border-red-400" : "border-transparent"}`}
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
          <div className="flex flex-col gap-1">
            <p className="mr-2 text-primary">كلمة المرور</p>
            <div className="flex items-center">
              <input
                type="password"
                placeholder="كلمة المرور"
                className={`h-[55px] w-[368px] -ml-1 bg-background-primary rounded-r-lg py-2 px-4 focus:outline-none placeholder:text-sm ${error.password ? "border-red-400" : "border-transparent"}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex items-center justify-center size-[55px] rounded-[8px] bg-primary">
                <Lock className="size-[25px] text-white" />
              </div>
            </div>

            <div
              className={`flex-1 flex items-center ${error.password ? "justify-between" : "justify-end"} text-sm`}>
              {error.password && (
                <div className="text-sm mt-1 flex items-center justify-start gap-1 pr-1">
                  <AlertCircle className="size-[16px] text-red-600" />
                  <span className="text-sm text-gray-600">{error.password}</span>
                </div>
              )}
              <a href="#" className="text-primary hover:underline">
                نسيت كلمة المرور؟
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            onClick={handleLogin}
            className="bg-primary text-white py-2 px-4 rounded-md cursor-pointer h-[50px] font-black text-lg flex items-center justify-center disabled:cursor-not-allowed">
            {loading ? <LoaderIcon className="size-7 animate-spin" /> : "دخول"}
          </button>
        </div>
      </div>

      {/* LEFT SIDE */}
      <div className="w-213 bg-primary flex items-center justify-center rounded-r-xl">
        <img src={loginLogo} alt="Login Logo" className="size-[500px]" />
      </div>
    </div>
  );
}

export default LoginPage