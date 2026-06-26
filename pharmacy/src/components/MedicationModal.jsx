import React, { useEffect, useState } from 'react';
import { 
  X, Pill, ShieldAlert, Info, Image as ImageIcon, DollarSign, 
  Activity, Hash, MapPin, Factory, Calendar, ThermometerSun, 
  AlertTriangle, Ban, FileText, CheckCircle, FileWarning
} from 'lucide-react';

const InfoBadge = ({ icon: Icon, label, value, ltr, colorClass = "text-primary bg-primary/10" }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${colorClass}`}>
      <Icon size={18} strokeWidth={2.5} />
    </div>
    <div className="flex flex-col gap-1 w-full overflow-hidden">
      <span className="text-xs text-gray-500 font-bold">{label}</span>
      <span className={`text-sm font-black text-gray-800 truncate ${ltr ? 'text-left' : 'text-right'}`} dir={ltr ? 'ltr' : 'rtl'}>
        {value}
      </span>
    </div>
  </div>
);

const WarningCard = ({ icon: Icon, title, content, colorTheme }) => {
  const themes = {
    red: "bg-red-50 border-red-100 text-red-600",
    orange: "bg-orange-50 border-orange-100 text-orange-600",
    primary: "bg-primary/5 border-primary/20 text-primary",
  };
  const themeClass = themes[colorTheme] || themes.primary;

  return (
    <div className={`p-4 rounded-2xl border ${themeClass} flex gap-3 items-start`}>
       <div className="shrink-0 mt-0.5 bg-white/50 p-1.5 rounded-lg">
         <Icon size={18} strokeWidth={2.5} />
       </div>
       <div className="flex flex-col gap-1">
         <span className="text-[13px] font-black opacity-90">{title}</span>
         <p className="text-[13px] font-semibold text-gray-700 leading-relaxed">{content}</p>
       </div>
    </div>
  );
};

const MedicationModal = ({ med, onClose, isPricingMode, setIsPricingMode, price, setPrice, onConfirmAdd, isLoading = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Simple entry animation effect
  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!med) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
       {/* Backdrop */}
       <div 
         className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
         onClick={() => !isPricingMode && onClose()}
       ></div>

       {/* Modal Content */}
       <div className={`relative bg-background rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-all duration-300 transform ${isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}>
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary to-[#42bba8] px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 overflow-hidden shrink-0">
             {/* Decorative bg */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             
             <div className="flex items-center justify-between relative z-10 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                   <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner border border-white/20 shrink-0">
                      <img src={med.images?.[0]} alt={med.englishName} className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md" />
                   </div>
                   <div className="flex flex-col min-w-0">
                      <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight drop-shadow-sm truncate" dir="ltr">{med.englishName}</h2>
                      <span className="text-xs sm:text-sm font-semibold text-white/80 truncate">{med.arabicName}</span>
                   </div>
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                >
                   <X size={18} strokeWidth={2.5} />
                </button>
             </div>
          </div>
          
          {/* Body */}
          <div className="overflow-y-auto p-4 sm:p-6 flex flex-col gap-6 sm:gap-8 text-right flex-1 no-scrollbar">
             {isPricingMode ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 gap-4 m-auto animate-[fadeIn_0.3s_ease-out]">
                   <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-2 shadow-inner border border-primary/20 rotate-3">
                      <DollarSign size={40} strokeWidth={2.5} />
                   </div>
                   <h3 className="text-2xl font-black text-gray-800">تحديد سعر الدواء</h3>
                   <p className="text-gray-500 text-sm text-center max-w-sm font-semibold leading-relaxed">
                      الرجاء إدخال سعر بيع الدواء <span className="text-primary font-bold">({med.arabicName})</span> في صيدليتك لإضافته إلى مخزونك.
                   </p>
                   <div className="mt-6 w-full max-w-xs relative group">
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-primary font-bold">ر.ي</div>
                      <input 
                         type="number" 
                         value={price}
                         onChange={(e) => setPrice(e.target.value)}
                         placeholder="0" 
                         className="w-full h-14 bg-white rounded-2xl pr-12 pl-4 text-center text-xl font-black text-gray-800 border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                      />
                   </div>
                </div>
             ) : (
                <div className="flex flex-col gap-8">
                   {/* Grid Info */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoBadge icon={Activity} label="الاسم العلمي" value={med.genericName} ltr />
                      <InfoBadge icon={Pill} label="التركيز" value={med.concentration} ltr colorClass="text-purple-600 bg-purple-100" />
                      <InfoBadge icon={Hash} label="رقم التسجيل" value={med.registrationNumber} ltr colorClass="text-blue-600 bg-blue-100" />
                      
                      <InfoBadge icon={Factory} label="الشركة المصنعة" value={med.manufacturer} ltr colorClass="text-orange-600 bg-orange-100" />
                      <InfoBadge icon={MapPin} label="بلد المنشأ" value={med.countryOfManufacture} colorClass="text-emerald-600 bg-emerald-100" />
                      <InfoBadge icon={Calendar} label="الفئة العمرية" value={typeof med.ageGroup === 'object' ? (med.ageGroup.type === 'جميع الأعمار' ? 'جميع الأعمار' : med.ageGroup.type === 'حد أدنى' ? `+${med.ageGroup.minAge} سنوات` : `من ${med.ageGroup.minAge} إلى ${med.ageGroup.maxAge} سنة`) : med.ageGroup} colorClass="text-pink-600 bg-pink-100" />
                   </div>

                   {/* Medical Info & Warnings */}
                   <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                            <ShieldAlert size={18} strokeWidth={2.5} />
                         </div>
                         <h3 className="text-lg font-black text-gray-800">المعلومات الطبية والتحذيرات</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <WarningCard icon={AlertTriangle} title="التحذيرات" content={med.warnings} colorTheme="orange" />
                         <WarningCard icon={Ban} title="موانع الاستخدام" content={med.contraindications} colorTheme="red" />
                         <div className="md:col-span-2">
                            <WarningCard icon={FileWarning} title="الآثار الجانبية الممكنة" content={med.sideEffects} colorTheme="primary" />
                         </div>
                      </div>
                   </div>

                   {/* Description & Storage */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Desc */}
                      <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
                         <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                               <FileText size={18} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-lg font-black text-gray-800">الوصف العام</h3>
                         </div>
                         <p className="text-[13px] text-gray-600 leading-relaxed font-semibold">
                            {med.description}
                         </p>
                      </div>

                      {/* Characteristics */}
                      <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                         <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                               <Info size={18} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-lg font-black text-gray-800">خصائص الدواء</h3>
                         </div>
                         
                         <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                               <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                  <FileText size={14} /> يتطلب وصفة طبية
                               </span>
                               {med.requiresPrescription ? (
                                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-black">نعم، إلزامي</span>
                               ) : (
                                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-xs font-black">لا يتطلب</span>
                               )}
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                               <span className="text-xs font-bold text-gray-500 flex items-center gap-2 shrink-0 mt-0.5">
                                  <ThermometerSun size={14} /> التخزين
                               </span>
                               <span className="text-xs font-bold text-gray-800 text-right leading-relaxed">{med.storageConditions}</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Gallery */}
                   <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                      <div className="flex items-center gap-2 mb-1">
                         <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                            <ImageIcon size={18} strokeWidth={2.5} />
                         </div>
                         <h3 className="text-lg font-black text-gray-800">معرض الصور</h3>
                      </div>
                      
                      <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
                         {med.images?.map((img, i) => (
                            <div key={i} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center p-3 shrink-0 hover:border-primary/30 transition-colors cursor-pointer">
                               <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" />
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             )}
          </div>
          
          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-100 flex flex-row justify-end gap-2 sm:gap-3 bg-white shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
             <button
                onClick={() => {
                   if (isPricingMode) setIsPricingMode(false);
                   else onClose();
                }}
                disabled={isLoading}
                className="h-11 sm:h-12 border-2 border-gray-200 text-gray-600 rounded-xl px-5 sm:px-8 font-black text-sm hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
             >
                {isPricingMode ? "رجوع" : "إلغاء"}
             </button>
             <button
                onClick={() => {
                   if (isPricingMode) onConfirmAdd();
                   else setIsPricingMode(true);
                }}
                disabled={isLoading}
                className="h-11 sm:h-12 bg-primary text-white rounded-xl px-5 sm:px-8 font-black text-sm hover:bg-primary/90 transition-all cursor-pointer active:scale-95 shadow-lg shadow-primary/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
             >
                {isPricingMode ? (
                   isLoading ? (
                      <>
                         <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                         </svg>
                         جارٍ الإضافة...
                      </>
                   ) : (
                      <>
                         <CheckCircle size={18} strokeWidth={2.5} /> تأكيد الإضافة
                      </>
                   )
                ) : (
                   <>
                      <DollarSign size={18} strokeWidth={2.5} /> إضافة الدواء
                   </>
                )}
             </button>
          </div>
       </div>
    </div>
  );
};

export default MedicationModal;
