import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Upload, Trash2, LoaderIcon, AlertCircle } from "lucide-react";
import { DRUGCATEGORIES, DRUGTYPES } from "../utils/constant.js";

const INITIAL_FORM = {
  arabicName: "",
  englishName: "",
  genericName: "",
  concentration: "",
  registrationNumber: "",
  category: "",
  type: "",
  ageGroupType: "جميع الأعمار",
  minAge: "",
  maxAge: "",
  manufacturer: "",
  countryOfManufacture: "",
  sideEffects: "",
  warnings: "",
  contraindications: "",
  requiresPrescription: false,
  storageConditions: "",
  description: "",
  images: [],
};



/* ── small reusable field components ── */
const Label = ({ text, required }) => (
  <p className="text-primary-400 text-sm font-normal mb-1">
    {required && <span className="text-red-400 ml-0.5 font-serif">*</span>}
    {text}
  </p>
);

const Field = ({ children, error }) => (
  <div className="flex flex-col">
    {children}
    {error && (
      <div className="text-xs mt-1 flex items-center justify-start gap-1 pr-1">
        <AlertCircle className="size-[16px] text-red-600" />
        <span className="text-sx text-gray-400">{error}</span>
      </div>
    )}
  </div>
);

const Input = ({ error, ...props }) => (
  <input
    {...props}
    className={`h-[42px] w-full bg-background-primary rounded-lg px-3 text-sm text-gray-700 placeholder:text-gray-300 border focus:outline-none focus:border-primary/50 transition-colors ${
      error ? "border-red-300" : "border-transparent"
    }`}
  />
);

const Textarea = ({ error, ...props }) => (
  <textarea
    {...props}
    rows={3}
    className={`w-full bg-background-primary rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-300 border focus:outline-none focus:border-primary/50 transition-colors resize-none ${
      error ? "border-red-300" : "border-transparent"
    }`}
  />
);

const SectionTitle = ({ text }) => (
  <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-1">
    <div className="size-2 rounded-full bg-primary" />
    <h3 className="text-primary font-black text-sm">{text}</h3>
  </div>
);

/* ── Select Dropdown ── */
function SelectDropdown({ value, onChange, options, placeholder, error }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`relative h-[42px] bg-background-primary rounded-lg px-3 flex items-center justify-between cursor-pointer select-none border  focus-within:border-primary/50
           ${error ? "border-red-300" : "border-transparent"}`}
      onClick={() => setOpen((p) => !p)}>
      <span className={`text-sm ${value ? "text-primary" : "text-gray-300"}`}>
        {value || placeholder}
      </span>
      <ChevronDown
        size={14}
        className={`text-primary transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
      />
      {open && (
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

/* ── Image Upload ── */
function ImageUpload({ images, onChange , error}) {
  const inputRef = useRef();
    
  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((f) => ({
      
      file: f,
      url: URL.createObjectURL(f),
    }));
    
    onChange([...images, ...previews]);
    e.target.value = "";
  };

  const remove = (idx) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-3">
      <input
        disabled={images.length === 3}
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {/* Drop zone */}
      <label
        onClick={() => inputRef.current?.click()}
        className={`w-full min-h-[90px] border-2 border-dashed border-primary/30 rounded-xl bg-background-primary  flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors
          py-4  ${error ? "border-red-300 bg-red-50" : "border-transparent"}
        `}>
        <div className="relative">
          <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload size={18} className="text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 size-4 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">+</span>
          </div>
        </div>
        <p className="text-primary text-xs font-medium">اضغط للرفع</p>
        <p className="text-gray-300 text-[10px]">
          PNG, JPG - حد أقصى 1MB لكل صورة
        </p>
      </label>
     {error && (<div className="text-sm flex items-center justify-start gap-1 pr-1">
        <AlertCircle className="size-[16px] text-red-600" />
        <span className="text-sm text-gray-600">{error}</span>
      </div>)}
      {/* Previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group w-50 h-40 rounded-xl overflow-hidden border border-gray-100">
              <img src={img.url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute cursor-pointer inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Trash2 size={16} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── MAIN MODAL ── */
export default function AddMedicineModal({ onClose, onAddSubmit, onUpdateSubmit, isLoading, onUpdate = null }) {
 
  let FormData = null;
  if(onUpdate){
    FormData = {
      ...onUpdate,
      ageGroupType: onUpdate?.ageGroup?.type,
      minAge: onUpdate?.ageGroup?.minAge || "",
      maxAge: onUpdate?.ageGroup?.maxAge || "",
      images: onUpdate?.images.map((i) => ({file: null, url: i}))
    };
  }

  const [form, setForm] = useState(FormData || INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((p) =>( { ...p, [key]: val })
    );
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.arabicName.trim())
      e.arabicName = "هذا الحقل لا يجب ان يكون فارغا";
    if (!form.englishName.trim())
      e.englishName = " هذا الحقل لا يجب ان يكون فارغا";
    if (!form.genericName.trim())
      e.genericName = " هذا الحقل لا يجب ان يكون فارغا";
    if (!form.concentration.trim())
      e.concentration = " هذا الحقل لا يجب ان يكون فارغا";
    if (!form.category) e.category = "يجب اختيار فئة للدواء";
    if (!form.type) e.type = "يجب اختيار نوع للدواء";
    if (!form.registrationNumber)
      e.registrationNumber = "رقم التسجيل يجب الا يكون فارغا";
    if (!form.manufacturer) e.manufacturer = "يجب ادخال اسم الشركة المصنعة";
    if (!form.countryOfManufacture)
      e.countryOfManufacture = "يجب ادخال البلد المنشأ";
    if (form.images.length === 0)
      e.images = "يجب اختيار صورة دواء واحدة على الاقل";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if(onUpdate){
      onUpdateSubmit(form)
    }else{
      onAddSubmit(form);
    }
  };

  return (
    <div
      className="fixed inset-0 z-45 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-6"
      onClick={() => {
        if (!isLoading) {
          onClose();
        }
      }}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[800px] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-2xl border-b border-gray-100 shrink-0">
          <h2 className="text-primary font-black text-base">إضافة دواء جديد</h2>
          <button
            onClick={() => {
              if (!isLoading) {
                onClose();
              }
            }}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 flex flex-col gap-5">
          {/* ── 1. المعلومات الأساسية ── */}
          <section>
            <SectionTitle text="المعلومات الأساسية" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field error={errors.arabicName}>
                <Label text="الاسم بالعربي" required />
                <Input
                  placeholder="مثال: باراسيتامول"
                  value={form.arabicName}
                  onChange={(e) => set("arabicName", e.target.value)}
                  error={errors.arabicName}
                />
              </Field>
              <Field error={errors.englishName}>
                <Label text="الاسم بالإنجليزي" required />
                <Input
                  placeholder="e.g Paracetamol"
                  value={form.englishName}
                  onChange={(e) => set("englishName", e.target.value)}
                  error={errors.englishName}
                  dir="ltr"
                />
              </Field>
              <Field error={errors.genericName}>
                <Label text="الاسم العلمي (generic Name)" required />
                <Input
                  placeholder="e.g Acetaminophen"
                  value={form.genericName}
                  onChange={(e) => set("genericName", e.target.value)}
                  error={errors.genericName}
                  dir="ltr"
                />
              </Field>
              <Field error={errors.concentration}>
                <Label text="التركيز" required />
                <Input
                  placeholder="مثال: 500mg"
                  value={form.concentration}
                  onChange={(e) => set("concentration", e.target.value)}
                  error={errors.concentration}
                />
              </Field>

              <Field error={errors.category}>
                <Label text="التصنيف" required />
                <SelectDropdown
                  value={form.category}
                  onChange={(v) => set("category", v)}
                  options={DRUGCATEGORIES.filter((c) => c !== "جميع التصنيفات")}
                  placeholder="اختر التصنيف"
                  error={errors.category}
                />
              </Field>

              <Field error={errors.type}>
                <Label text="شكل الدواء" required />
                <SelectDropdown
                  value={form.type}
                  onChange={(v) => set("type", v)}
                  options={DRUGTYPES.filter((t) => t !== "جميع الأنواع")}
                  placeholder="اختر النوع"
                  error={errors.type}
                />
              </Field>
              <Field error={errors.registrationNumber}>
                <Label text="رقم التسجيل الرسمي" required />
                <Input
                  placeholder="Reg-XXXX"
                  value={form.registrationNumber}
                  onChange={(e) => set("registrationNumber", e.target.value)}
                  error={errors.registrationNumber}
                />
              </Field>
            </div>
          </section>

          {/* ── 2. الفئة العمرية ── */}
          <section>
            <SectionTitle text="الفئة العمرية" />
            <div className="bg-white rounded-xl p-4 flex flex-col gap-3">
              <Field>
                <Label text="الحد الأدنى للعمر" />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.minAge}
                    onChange={(e) => {
                      set("minAge", e.target.value);
                    }}
                    disabled={form.ageGroupType === "جميع الأعمار"}
                    className="w-24"
                  />
                  <span className="text-gray-400 text-sm shrink-0">سنة</span>
                  <div className="w-40">
                    <SelectDropdown
                      value={form.ageGroupType}
                      onChange={(v) => set("ageGroupType", v)}
                      options={["جميع الأعمار", "حد أدنى", "نطاق"]}
                      placeholder="النوع"
                    />
                  </div>
                </div>
              </Field>
              {form.ageGroupType === "نطاق" && (
                <Field>
                  <Label text="الحد الأقصى للعمر" />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={form.maxAge}
                      onChange={(e) => set("maxAge", e.target.value)}
                    />
                    <span className="text-gray-400 text-sm shrink-0">سنة</span>
                  </div>
                </Field>
              )}
              <p className="text-gray-300 text-xs">
                اتركها كـ (كل) إذا كان ينطبق على جميع الفئات العمرية
              </p>
            </div>
          </section>

          {/* ── 3. المصنع والمنشأ ── */}
          <section>
            <SectionTitle text="المصنع والمنشأ" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field error={errors.manufacturer}>
                <Label text="الشركة المصنعة" required />
                <Input
                  placeholder="e.g Pfizer"
                  value={form.manufacturer}
                  onChange={(e) => set("manufacturer", e.target.value)}
                  dir="ltr"
                  error={errors.manufacturer}
                />
              </Field>
              <Field error={errors.countryOfManufacture}>
                <Label text="بلد المنشأ" required />
                <Input
                  placeholder="مثال: ألمانيا"
                  value={form.countryOfManufacture}
                  onChange={(e) => set("countryOfManufacture", e.target.value)}
                  error={errors.countryOfManufacture}
                />
              </Field>
            </div>
          </section>

          {/* ── 4. المعلومات الطبية ── */}
          <section>
            <SectionTitle text="المعلومات الطبية" />
            <div className="flex flex-col gap-3">
              <Field>
                <Label text="التحذيرات" />
                <Textarea
                  placeholder="تحذيرات قبل استخدام الدواء..."
                  value={form.warnings}
                  onChange={(e) => set("warnings", e.target.value)}
                />
              </Field>
              <Field>
                <Label text="الآثار الجانبية" />
                <Textarea
                  placeholder="الآثار الجانبية المحتملة..."
                  value={form.sideEffects}
                  onChange={(e) => set("sideEffects", e.target.value)}
                />
              </Field>
              <Field>
                <Label text="موانع الاستخدام" />
                <Textarea
                  placeholder="لا يُنصح باستخدامه في حالة المعرفة الموروثة..."
                  value={form.contraindications}
                  onChange={(e) => set("contraindications", e.target.value)}
                />
              </Field>
            </div>
          </section>

          {/* ── 5. خصائص الدواء ── */}
          <section>
            <SectionTitle text="خصائص الدواء" />
            <div className="bg-background-primary rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-gray-500 text-sm">يتطلب وصفة طبية</span>
              <button
                type="button"
                onClick={() =>
                  set("requiresPrescription", !form.requiresPrescription)
                }
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${
                  form.requiresPrescription ? "bg-primary" : "bg-gray-200"
                }`}>
                <span
                  className={`absolute top-0.5 size-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    form.requiresPrescription
                      ? "translate-x-0 right-0.5"
                      : "right-5"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* ── 6. شروط التخزين ── */}
          <section>
            <SectionTitle text="شروط التخزين" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <Label text="تعليمات التخزين" />
                <Input
                  placeholder="مثال: يحفظ بين درجة 2-8 مئوية"
                  value={form.storageConditions}
                  onChange={(e) => set("storageConditions", e.target.value)}
                />
              </Field>
              <Field>
                <Label text="وصف عام (اختياري)" />
                <Input
                  placeholder="وصف مختصر عن الدواء..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
            </div>
          </section>

          {/* ── 7. صور الدواء ── */}
          <section>
            <SectionTitle text="صور الدواء" />
            <ImageUpload
              images={form.images}
              onChange={(imgs) => set("images", imgs)}
              error={errors.images}
            />
          </section>
        </div>

        {/* FOOTER */}
        <div className="flex items-center gap-3 px-5 py-4 bg-white border-t border-gray-100 rounded-b-2xl shrink-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSubmit()}
            className="flex-1 h-[42px] bg-primary text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            {isLoading ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : onUpdate ? (
              "حفظ التغيرات"
            ) : (
              "حفظ الدواء"
            )}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 h-[42px] border border-gray-200 text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
