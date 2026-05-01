import {
  X,
  Clock,
  Star,
  UserRound,
  ShieldCheck,
  Stethoscope,
  Tag,
  FileText,
} from "lucide-react";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "منذ لحظات";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  return `منذ ${Math.floor(diff / 86400)} أيام`;
}

export default function ArticleDetailModal({
  article,
  onClose,
}) {
  if (!article) return null;
  const isDoctor = article.authorRole === "Doctor";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-6"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[680px] max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-primary font-black text-base">تفاصيل المقال</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* COVER IMAGE */}
          {article.image ? (
            <div className="w-full h-[220px] overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-[160px] bg-background-primary flex items-center justify-center">
              <FileText size={40} className="text-primary/20" />
            </div>
          )}

          <div className="flex flex-col gap-4 p-5 text-right">
            {/* BADGES */}
            <div className="flex items-center gap-2 flex-wrap justify-start">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-background-primary text-primary/70">
                <Tag size={11} />
                {article.category}
              </span>
              {article.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  <Star size={11} fill="currentColor" />
                  مميزة
                </span>
              )}
            </div>

            {/* TITLE */}
            <h1 className="text-primary font-black text-xl leading-snug">
              {article.title}
            </h1>

            {/* DESCRIPTION */}
            <p className="text-gray-400 text-sm leading-relaxed border-r-2 border-primary/30 pr-3">
              {article.description}
            </p>

            {/* DIVIDER */}
            <div className="h-px bg-gray-100" />

            {/* CONTENT */}
            <div className="flex flex-col gap-1">
              <p className="text-primary font-semibold text-sm">المحتوى</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                {article.content}
              </p>
            </div>

            {/* DIVIDER */}
            <div className="h-px bg-gray-100" />

            {/* AUTHOR + DATE */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* AUTHOR */}
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {isDoctor ? (
                    <UserRound size={16} className="text-primary" />
                  ) : (
                    <ShieldCheck size={16} className="text-primary" />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1">
                    <span className="text-primary text-sm font-black">
                      {article.authorName}
                    </span>
                  
                  </div>
                  {isDoctor && article.authorSpecialty && (
                    <span className="text-gray-400 text-xs">
                      {article.authorSpecialty}
                    </span>
                  )}
                </div>
               
              </div>
              {/* DATE */}
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Clock size={13} />
                <span>{timeAgo(article.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl shrink-0">
         
          <button
            onClick={onClose}
            className="px-5 h-[40px] border border-gray-200 text-gray-400 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
