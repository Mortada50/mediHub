import { useState, useRef, useEffect } from "react";
import { X, Upload, Star, LoaderIcon, Trash2, ChevronDown, AlertCircle } from "lucide-react";
import { ARTICLE_CATEGORIES } from "../utils/constant";

const INITIAL_FORM = {
  title: "",
  description: "",
  content: "",
  category: "",
  isFeatured: false,
  image: null,
  imagePreview: null,
};

/* ── helpers ── */
const Label = ({ text, required }) => (
  <p className="text-primary-400 text-sm mb-1 text-right">
    {required && <span className="text-red-400 ml-0.5 font-serif">*</span>}
    {text}
  </p>
);

const Input = ({ error, isLoading , ...props }) => (
  <input
    readOnly={isLoading}
    {...props}
    className={`h-[42px] w-full bg-background-primary rounded-lg px-3 text-sm text-gray-600 placeholder:text-gray-300 border focus:outline-none focus:border-primary/40 transition-colors text-right ${
      error ? "border-red-300" : "border-transparent"
    }`}
  />
);

const Textarea = ({ error, isLoading, rows = 4, ...props }) => (
  <textarea
    readOnly={isLoading}
    {...props}
    rows={rows}
    className={`w-full bg-background-primary rounded-lg px-3 py-2.5 text-sm text-gray-600 placeholder:text-gray-300 border focus:outline-none focus:border-primary/40 transition-colors resize-none text-right ${
      error ? "border-red-300" : "border-transparent"
    }`}
  />
);

const SectionTitle = ({ text }) => (
  <div className="flex items-center gap-2 mb-3 justify-start border-b border-gray-100">
    <div className="size-2 rounded-full bg-primary mb-1" />
    <h3 className="text-primary font-black text-sm mb-1">{text}</h3>
  </div>
);

/* ── Category Select ── */
function CategorySelect({ value, onChange, error, isLoading }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`relative h-[42px] bg-background-primary rounded-lg px-3 flex items-center justify-between cursor-pointer select-none border transition-colors ${
        error
          ? "border-red-300"
          : "border-transparent focus-within:border-primary/40"
      }`}
      onClick={() => setOpen((p) => !p)}>
      <span className={`text-sm ${value ? "text-primary" : "text-gray-300"}`}>
        {value || "اختر التصنيف"}
      </span>
      <ChevronDown
        size={14}
        className={`text-primary transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
      />
      {open && !isLoading && (
        <div
          className="absolute z-30 top-[46px] left-0 right-0 bg-white shadow-lg border border-gray-100 rounded-xl p-1.5 max-h-[200px] overflow-y-auto no-scrollbar"
          onClick={(e) => e.stopPropagation()}>
          {ARTICLE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onChange(cat);
                setOpen(false);
              }}
              className="w-full text-right text-sm text-gray-500 hover:bg-background-primary hover:text-primary px-3 py-2 rounded-lg transition-colors cursor-pointer">
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Image Upload ── */
function CoverImageUpload({ preview, onChange, onRemove, isLoading }) {
  const inputRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onChange({ file, preview: URL.createObjectURL(file) });
    e.target.value = "";
  };

  if (preview) {
    return (
      <div className="relative w-full h-[180px] rounded-xl overflow-hidden group border border-gray-100">
        <img src={preview} alt="cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          {!isLoading && <label
            
            htmlFor="article-cover"
            className="flex items-center gap-1 bg-white text-primary text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer hover:bg-primary hover:text-white transition-colors">
            <Upload size={13} />
            تغيير
          </label>}
          <button
            type="button"
            onClick={() => !isLoading && onRemove()}
            className="flex items-center gap-1 bg-white text-red-500 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors cursor-pointer">
            <Trash2 size={13} />
            حذف
          </button>
        </div>
        <input
          id="article-cover"
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    );
  }

  return (
    <label
      htmlFor="article-cover"
      className="w-full h-[120px] border-2 border-dashed border-primary/30 rounded-xl bg-background-primary flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
      <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
        <Upload size={18} className="text-primary" />
      </div>
      <p className="text-primary text-xs font-medium">اضغط لرفع صورة الغلاف</p>
      <p className="text-gray-300 text-[10px]">PNG, JPG - حد أقصى 5MB</p>
      {!isLoading && <input
        id="article-cover"
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />}
    </label>
  );
}

/* ── MAIN COMPONENT ── */
export default function ArticleFormModal({
  mode = "add", // "add" | "edit"
  article = null, // populated when mode === "edit"
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  /* populate form when editing */
  useEffect(() => {
    if (isEdit && article) {
      setForm({
        title: article.title ?? "",
        description: article.description ?? "",
        content: article.content ?? "",
        category: article.category ?? "",
        isFeatured: article.isFeatured ?? false,
        image: null,
        imagePreview: article.image ?? null,
      });
    }
  }, [isEdit, article]);

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "العنوان لا يجب ان يكون فارغا";
    if (!form.description.trim()) e.description = "الوصف لا يجب ان يكون فارغا";
    if (!form.content.trim()) e.content = "المحتوى لا يجب ان يكون فارغا";
    if (!form.category) e.category = "يجب اختيار فئة المقال";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    
    if (!validate()) return;
     onSubmit?.({ ...form, ...(isEdit ? { _id: article._id } : {}) });
  };

  return (
    <div
      
      className="fixed inset-0 z-45 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-6"
      onClick={() => !isLoading && onClose()}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-2xl border-b border-gray-200 shrink-0">
          <h2 className="text-primary font-black text-base">
            {isEdit ? "تعديل المقال" : "إضافة مقال جديد"}
          </h2>
          <button
            onClick={() => !isLoading && onClose()}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 flex flex-col gap-5">
          {/* 1. المعلومات الأساسية */}
          <section>
            <SectionTitle text="المعلومات الأساسية" />
            <div className="flex flex-col gap-3">
              <div>
                <Label text="عنوان المقال" required />
                <Input
                  placeholder="أدخل عنوان المقال..."
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  error={errors.title}
                  isLoading={isLoading}
                />
                {errors.title && <AlertError error={errors.title} />}
              </div>

              <div>
                <Label text="التصنيف" required />
                <CategorySelect
                  value={form.category}
                  onChange={(v) => set("category", v)}
                  error={errors.category}
                  isLoading={isLoading}
                />
                {errors.category && <AlertError error={errors.category} />}
              </div>

              <div>
                <Label text="وصف مختصر" required />
                <Textarea
                  rows={2}
                  placeholder="وصف مختصر يظهر في قائمة المقالات..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  error={errors.description}
                  isLoading={isLoading}
                />
                {errors.description && (
                  <AlertError error={errors.description} />
                )}
              </div>
            </div>
          </section>

          {/* 2. المحتوى */}
          <section>
            <SectionTitle text="محتوى المقال" />
            <div>
              <Label text="النص الكامل" required />
              <Textarea
                rows={7}
                placeholder="اكتب محتوى المقال هنا..."
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                error={errors.content}
                isLoading={isLoading}
              />
              {errors.content && <AlertError error={errors.content} />}
            </div>
          </section>

          {/* 3. خصائص المقال */}
          <section>
            <SectionTitle text="خصائص المقال" />
            <div className="bg-background-primary rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star
                  size={15}
                  className={form.isFeatured ? "text-primary" : "text-gray-300"}
                  fill={form.isFeatured ? "currentColor" : "none"}
                />
                <span className="text-gray-700 text-sm">تمييز المقال</span>
              </div>
              <button
                disabled={isLoading}
                type="button"
                onClick={() => set("isFeatured", !form.isFeatured)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${
                  form.isFeatured ? "bg-primary" : "bg-gray-200"
                }`}>
                <span
                  className={`absolute top-0.5 size-5 bg-white rounded-full shadow transition-all duration-200 ${
                    form.isFeatured ? "right-0.5" : "right-5"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* 4. صورة الغلاف */}
          <section>
            <SectionTitle text="صورة الغلاف" />
            <CoverImageUpload
              preview={form.imagePreview}
              onChange={({ file, preview }) => {
                set("image", file);
                set("imagePreview", preview);
              }}
              onRemove={() => {
                set("image", null);
                set("imagePreview", null);
              }}
              isLoading={isLoading}
            />
          </section>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex items-center gap-3 px-5 py-4 bg-white border-t border-gray-100 rounded-b-2xl shrink-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="flex-1 h-[42px] bg-primary text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            {isLoading ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : isEdit ? (
              "حفظ التعديلات"
            ) : (
              "نشر المقال"
            )}
          </button>
          <button
            type="button"
            onClick={() => !isLoading && onClose()}
            className="flex-1 h-[42px] border border-gray-200 text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertError({error}) {
  return (
    <div className="text-xs mt-1 flex items-center justify-start gap-1 pr-1">
      <AlertCircle className="size-[16px] text-red-600" />
      <span className="text-sx text-gray-400">{error}</span>
    </div>
  )
}
