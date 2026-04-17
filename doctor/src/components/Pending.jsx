import loginLogo from "../assets/login-logo.png";
import { LogOut, Clock, Frown, MessageCircle, Pencil } from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import PageLoader from "./PageLoader.jsx";
import {useNavigate} from "react-router"
import { useEffect } from "react";
// import { useEffect } from "react";


function Pending() {
  const navigate = useNavigate();
  const { user } = useUser();
  const {signOut} = useAuth();
  const name = user?.publicMetadata?.fullName || user?.fullName || "";
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const accountType = user?.publicMetadata?.role === "doctor" ? "دكتور" : "";
  const status = user?.publicMetadata?.status;
  
  let title = "حسابك قيد المراجعة"
  let discription = "شكراً لتسجيلك | فريق الادارة يراجع بياناتك للموافقة على طلبك";
  
  if(status === "rejected"){
     title = "تم رفض طلبك"
     discription = "نأسف | لم يتم قبول حسابك بعد مراجعة الإدارة";

  }

  // const reload = async () => {
    
  //   await user.reload();
  // }
  // return reload() &&( 
  
  useEffect(() => {
      user?.reload?.();
    }, [user?.id]);
    
    return (
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* RIGHT SIDE - Content */}
        <div className="flex-1 lg:w-147 bg-white flex flex-col items-center justify-center px-4 sm:px-8 py-12 lg:py-0">
          {/* Card */}
          <div className="w-full max-w-[420px] bg-white border border-gray-100 rounded-2xl shadow-sm px-6 sm:px-8 py-8 flex flex-col items-center gap-6">
            {/* Clock Icon */}
            <div
              className={`flex items-center justify-center size-[72px] sm:size-[80px] rounded-full border-[3px] ${status === "pending" ? "border-primary" : "border-red-500"} text-primary`}>
              {status === "rejected" ? (
                <Frown
                  className="text-red-500 size-8 sm:size-9"
                  strokeWidth={1.5}
                />
              ) : (
                <Clock className="size-8 sm:size-9" strokeWidth={1.5} />
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="flex flex-col items-center gap-2 text-center">
              <h1
                className={`${status === "pending" ? "text-primary" : "text-red-500"} font-black text-2xl sm:text-3xl`}>
                {title}
              </h1>
              <p
                className={`${status === "pending" ? "text-primary" : "text-red-500"} font-normal text-sm sm:text-base leading-relaxed`}>
                {discription}
              </p>
            </div>

            {/* User Info Box */}
            <div className="w-full bg-background-primary rounded-xl px-5 py-4 flex flex-col gap-3 text-right">
              <div className="flex items-center justify-start gap-2">
                <span className="text-primary text-sm shrink-0">الاسم:</span>
                <span className="text-gray-400 text-sm sm:text-base font-medium truncate">
                  {name}
                </span>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="flex items-center justify-start gap-2">
                <span className="text-primary text-sm shrink-0">
                  البريد الإلكتروني:
                </span>
                <span className="text-gray-400 text-sm truncate" dir="ltr">
                  {email}
                </span>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="flex items-center justify-start gap-2">
                <span className="text-primary text-sm shrink-0">
                  نوع الحساب:
                </span>
                <span className="text-gray-400 text-sm sm:text-base font-medium">
                  {accountType}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            {status === "pending" ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="w-full h-[50px] border-2 border-primary text-primary rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer group">
                <LogOut className="size-5 group-hover:text-white transition-colors duration-200" />
                العوده لتسجيل الدخول
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => window.open("https://wa.me/967781093536")}
                  className="w-full h-[50px] border-2 border-primary text-primary rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer group">
                  <MessageCircle className="size-5 group-hover:text-white transition-colors duration-200" />
                  التواصل مع الإدارة
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate("/doctor-registration", {
                      state: { update: true },
                    })
                  }
                  className="w-full h-[50px] border-2 border-primary text-primary rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer group">
                  <Pencil className="size-5 group-hover:text-white transition-colors duration-200" />
                  تعديل البيانات
                </button>
              </>
            )}
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

export default Pending;
