import loginLogo from "../assets/login-logo.png";
import { LogOut, Clock } from "lucide-react";

// Mock user data - replace with real props or context
const user = {
  name: "محمد مهيوب عبده محمد",
  email: "mohammedmahioh@gamil.com",
  accountType: "دكتور",
};

function Pending() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* RIGHT SIDE - Content */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center px-4 sm:px-8 py-12 lg:py-0">
        {/* Card */}
        <div className="w-full max-w-[420px] bg-white border border-gray-100 rounded-2xl shadow-sm px-6 sm:px-8 py-8 flex flex-col items-center gap-6">
          {/* Clock Icon */}
          <div className="flex items-center justify-center size-[72px] sm:size-[80px] rounded-full border-[3px] border-primary text-primary">
            <Clock className="size-8 sm:size-9" strokeWidth={1.5} />
          </div>

          {/* Title & Subtitle */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-primary font-black text-2xl sm:text-3xl">
              حسابك قيد المراجعة
            </h1>
            <p className="text-primary font-normal text-sm sm:text-base leading-relaxed">
              شكراً لتسجيلك | فريق الادارة يراجع بياناتك للموافقة على طلبك
            </p>
          </div>

          {/* User Info Box */}
          <div className="w-full bg-background-primary rounded-xl px-5 py-4 flex flex-col gap-3 text-right">
            <div className="flex items-center justify-start gap-2">
              <span className="text-primary text-sm shrink-0">الاسم:</span>
              <span className="text-gray-400 text-sm sm:text-base font-medium truncate">
                {user.name}
              </span>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="flex items-center justify-start gap-2">
              <span className="text-primary text-sm shrink-0">
                البريد الإلكتروني:
              </span>
              <span className="text-gray-400 text-sm truncate" dir="ltr">
                {user.email}
              </span>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="flex items-center justify-start gap-2">
              <span className="text-primary text-sm shrink-0">نوع الحساب:</span>
              <span className="text-gray-400 text-sm sm:text-base font-medium">
                {user.accountType}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            // onClick={}
            className="w-full h-[50px] border-2 border-primary text-primary rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer group">
            <LogOut className="size-5 group-hover:text-white transition-colors duration-200" />
            تسجيل الخروج
          </button>
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
