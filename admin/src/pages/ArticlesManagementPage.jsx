import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Star,
  Trash2,
  SquarePen,
  MoreVertical,
  Clock,
  UserRound,
  LoaderIcon,
} from "lucide-react";
import React, { useState } from "react";
import { SPECIALITIES, ARTICLE_CATEGORIES } from "../utils/constant";
import TableEmptyUI from "../components/TableEmptyUi.jsx";
import TableErrorUI from "../components/TableErrorUi.jsx";
import ArticleDetailModal from "../components/ArticleDetailModal.jsx";
import ArticleFormModal from "../components/ArticleFormModal.jsx";
import PageLoader from "../components/PageLoader.jsx"
import mediHubLogo from "../assets/login-logo.png";
import { useArticles } from "../hooks/useArticles.js";
import { useConfirm } from "../hooks/useConfirm.js";
import ConfirmModal from "../components/ConfirmModal.jsx";
import ErrorUIDialog from "../components/ErrorUIDialog.jsx";

const MOKO_ARTICLES = [
  {
    _id: "680a1001a1b2c3d4e5f60001",
    title: "أعراض السكري المبكرة التي لا يجب تجاهلها",
    description:
      "تعرف على العلامات المبكرة لمرض السكري وكيفية اكتشافه والتعامل معه مبكراً.",
    content:
      "يعد السكري من الأمراض المزمنة الشائعة، ومن المهم اكتشافه مبكراً لتجنب المضاعفات.",
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop",
    author: "680ad0011111111111110001",
    authorRole: "Doctor",
    authorName: "د. أحمد السقاف",
    authorSpecialty: "طب الغدد الصماء",
    category: "الأمراض والحالات الطبية",
    isFeatured: false,
    createdAt: "2026-04-01T10:00:00.000Z",
  },
  {
    _id: "680a1001a1b2c3d4e5f60002",
    title: "أفضل الأطعمة لتعزيز المناعة",
    description: "دليل غذائي لأهم الأطعمة التي تدعم الجهاز المناعي بشكل طبيعي.",
    content: "يمكن تعزيز المناعة من خلال تناول الأطعمة الغنية بفيتامين سي.",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop",
    author: "680ad0011111111111110002",
    authorRole: "Doctor",
    authorName: "د. سارة محمد",
    authorSpecialty: "طب عام",
    category: "التغذية والحمية",
    isFeatured: true,
    createdAt: "2026-04-02T08:30:00.000Z",
  },
  {
    _id: "680a1001a1b2c3d4e5f60003",
    title: "كيف تسيطر على القلق اليومي",
    description:
      "خطوات عملية بسيطة للمساعدة في تقليل القلق وتحسين الصحة النفسية.",
    content: "يمكن تقليل القلق من خلال تنظيم النوم وممارسة تمارين التنفس.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=200&fit=crop",
    author: "680ad0011111111111110003",
    authorRole: "Doctor",
    authorName: "د. خالد عبدالسلام",
    authorSpecialty: "الطب النفسي",
    category: "الصحة النفسية",
    isFeatured: false,
    createdAt: "2026-04-03T12:10:00.000Z",
  },
  {
    _id: "680a1001a1b2c3d4e5f60004",
    title: "نصائح مهمة للحامل في الثلث الأول",
    description: "تعرفي على أهم النصائح الطبية والغذائية خلال بداية الحمل.",
    content: "خلال الشهور الأولى من الحمل يجب الاهتمام بالتغذية السليمة.",
    image:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=300&h=200&fit=crop",
    author: "680ad0011111111111110004",
    authorRole: "Doctor",
    authorName: "د. منى العريقي",
    authorSpecialty: "طب النساء والتوليد",
    category: "صحة المرأة",
    isFeatured: true,
    createdAt: "2026-04-05T09:00:00.000Z",
  },
  {
    _id: "680a1001a1b2c3d4e5f60005",
    title: "هل المضادات الحيوية تعالج نزلات البرد",
    description: "مفاهيم خاطئة شائعة حول المضادات الحيوية ومتى يجب استخدامها.",
    content:
      "المضادات الحيوية لا تعالج نزلات البرد لأنها غالباً ناتجة عن فيروسات.",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop",
    author: "680ad0099999999999999999",
    authorRole: "Admin",
    authorName: "إدارة ميدي هب",
    authorSpecialty: null,
    category: "الأدوية والعلاجات",
    isFeatured: true,
    createdAt: "2026-04-07T11:15:00.000Z",
  },
  {
    _id: "680a1001a1b2c3d4e5f60006",
    title: "متى يحتاج الطفل زيارة طبيب الأطفال فوراً",
    description: "علامات تحذيرية تستدعي مراجعة الطبيب للأطفال بشكل عاجل.",
    content: "يجب مراجعة الطبيب فوراً إذا ظهرت على الطفل صعوبة تنفس.",
    image:
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=300&h=200&fit=crop",
    author: "680ad0011111111111110005",
    authorRole: "Doctor",
    authorName: "د. سامي القباطي",
    authorSpecialty: "طب الأطفال",
    category: "صحة الطفل",
    isFeatured: false,
    createdAt: "2026-04-09T14:20:00.000Z",
  },
];


/* ── time ago helper ── */
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "منذ لحظات";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  return `منذ ${Math.floor(diff / 86400)} أيام`;
}

/* ── Article Card ── */
function ArticleCard({
  article,
  onEdit,
  onDelete,
  onDetail,
  onToggle,
  isLoading,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isDoctor = article.authorRole === "doctor";

  return (
    <div className="bg-white rounded-xl overflow-hidden flex flex-col sm:flex-row gap-0 border border-gray-100 hover:shadow-md transition-shadow duration-200 relative">
      {/* IMAGE */}
      <div className="sm:w-[200px] sm:min-w-[200px] h-[160px] sm:h-auto overflow-hidden shrink-0">
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center">
            <img
              src={mediHubLogo}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 p-4 gap-2 text-right min-w-0">
        {/* CATEGORY BADGE */}
        <div className="flex items-center justify-between gap-2 flex-wrap-reverse">
          {/* BADGES */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-background-primary text-primary/70 whitespace-nowrap">
              {article.category}
            </span>
            {article.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary whitespace-nowrap">
                <Star size={11} fill="currentColor" />
                مميزة
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* ACTION BUTTONS */}

            <button
              disabled={isLoading}
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors cursor-pointer">
              <Trash2 size={15} />
            </button>
            {article.authorRole === "admin" && (
              <button
                disabled={isLoading}
                onClick={() => onEdit?.(article)}
                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-500 transition-colors cursor-pointer">
                <SquarePen size={15} />
              </button>
            )}
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="p-1.5 rounded-lg hover:bg-background-primary text-gray-400 hover:text-gray-500 transition-colors cursor-pointer">
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute bottom-10 left-4 z-20 bg-white shadow-lg border border-gray-100 rounded-xl p-1.5 min-w-[130px] flex flex-col gap-1">
                <button
                  disabled={isLoading}
                  onClick={onDetail}
                  className="text-right text-sm text-gray-500 hover:bg-background-primary px-3 py-2 rounded-lg transition-colors cursor-pointer">
                  عرض التفاصيل
                </button>
                <button
                  disabled={isLoading}
                  onClick={onToggle}
                  className={`${isLoading ? "text-center" : "text-right"} text-sm text-primary hover:bg-background-primary px-3 py-2 rounded-lg transition-colors cursor-pointer`}>
                  {isLoading ? (
                    <LoaderIcon className="size-4 animate-spin w-full" />
                  ) : article.isFeatured ? (
                    "إلغاء التمييز"
                  ) : (
                    "تمييز المقال"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TITLE */}
        <h3 className="text-primary font-black text-base leading-snug line-clamp-1">
          {article.title}
        </h3>

        {/* DESCRIPTION */}
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
          {article.description}
        </p>

        {/* FOOTER */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200 flex-wrap gap-2">
          {/* AUTHOR */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {isDoctor ? (
                    <UserRound size={14} className="text-primary" />
                  ) : (
                    <ShieldCheck size={14} className="text-primary" />
                  )}
                </div>
                <span className="text-primary text-xs font-semibold">
                  {article.authorName}
                </span>
              </div>
              {/* SPECIALTY — only for doctors */}
              {isDoctor && article.authorSpecialty && (
                <span className="text-gray-400 text-[10px] pr-[35px]">
                  {article.authorSpecialty}
                </span>
              )}
            </div>
          </div>

          {/* DATE */}
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock size={12} />
            <span>{timeAgo(article.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN PAGE ── */
function ArticlesManagementPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [openSpecialityDropDown, setOpenSpecialityDropDown] = useState(false);
  const [openCategoryDropDown, setOpenCategoryDropDown] = useState(false);
  const [speciality, setSpeciality] = useState("جميع التخصصات");
  const [category, setCategory] = useState("جميع التصنيفات");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { confirmState, confirm, close } = useConfirm();
  const [openErrorUiDialog, setOpenErrorUiDialog] = useState(true);

  const [detailArticle, setDetailArticle] = useState(null);
  const [formModal, setFormModal] = useState({
    open: false,
    mode: "add",
    article: null,
  });

  const itemPerPage = 5;

  const {
    articlesData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,

    addNewArticleMutation,
    addNewArticleError,
    isAddingNewArticleError,
    isAddingNewArticleLoading,

    updateArticleMutation,
    isUpdateingArticleLoading,
    isUpdateingArticleError,
    updateArticleError,

    toggleIsFeaturedStatusMutation,
    isToggleIsFeaturedStatusLoading,
    isToggleIsFeaturedStatusError,
    toggleIsFeaturedStatusError,

    deleteArticleMutation,
    isDeleteingArticleLoading,
    isDeleteingArticleError,
    deleteArticleError,
    
  } = useArticles();

  
  if(isLoading) return <PageLoader />;
  if (isError || !articlesData) {
       return (
         <table className="flex items-center justify-center h-full">
           <tbody>
             <TableErrorUI
               message={error?.message}
               onRetry={() => refetch()}
               onloading={isFetching}
             />
           </tbody>
         </table>
       );
     }

     const {
       totalArticles,
       adminArticles,
       doctorArticles,
       newArticlesThisMonth,
       adminArticlesPercentage,
       doctorArticlesPercentage,
       articlesList,
     } = articlesData;

  const allArticles = articlesList ?? [];

  const matchArticles = allArticles.filter((a) => {
    const matchTab =
      activeTab === "all" ||
      a.isFeatured === activeTab ||
      a.authorRole === activeTab;
    const matchSearch =
      !searchInput ||
      a.title?.includes(searchInput) ||
      a.description?.includes(searchInput) ||
      a.authorName?.includes(searchInput);
    const matchCat = category === "جميع التصنيفات" || a.category === category;
    const matchSpeciality =
      speciality === "جميع التخصصات" || a.authorSpecialty === speciality;
    return matchTab && matchSearch && matchCat && matchSpeciality;
  });

  const totalPages = Math.max(1, Math.ceil(matchArticles.length / itemPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const filtered = matchArticles.slice(
    (safePage - 1) * itemPerPage,
    safePage * itemPerPage,
  );

  const TABS = [
    { label: "كل المقالات", value: "all" },
    { label: "المميزة", value: true },
    { label: "مقالات الإدارة", value: "Admin" },
  ];

  const closeAllDropdowns = () => {
    setOpenSpecialityDropDown(false);
    setOpenCategoryDropDown(false);
  };

  const handleSubmit = (data) => {
      if (data._id)  {
        updateArticleMutation(data, {
          onSuccess: () => setFormModal({ open: false, mode: "add", article: null }),
          onError: () => console.log(updateArticleError),
        });

      }else {
        addNewArticleMutation(data, {
        onSuccess: () => setFormModal({ open: false, mode: "add", article: null }),
        onError: () => setOpenErrorUiDialog(true)

       })}
   
  };

  const handleToggleStatues= (articleId)=>{


    toggleIsFeaturedStatusMutation(articleId, {
      onSuccess: () => console.log("تم التحديث"),
      onError: () => setOpenErrorUiDialog(true),
    });
  }


  const handleDeleteArticle = (articleId, title) => {
     confirm({
       title: "حذف مقال",
       message: `هل أنت متأكد من انك تريد حذف المقالة '${title}' هذه العملية لا يمكن التراجع عنها`,
       variant: "danger",
       onConfirm: () => {
         deleteArticleMutation(
            articleId,
           {
             onSuccess: () => {
               close();
             },
             onError: () => {
               close();
               setOpenErrorUiDialog(true)
             },
           },
         );
       },
     });
  
  }
  

  return (
    <>
      {(isAddingNewArticleError || isUpdateingArticleError || isDeleteingArticleError || isToggleIsFeaturedStatusError) && openErrorUiDialog && (
        <ErrorUIDialog
          title="حدث خطأ"
          message="تعذر حذف المقالة يرجى المحاولة لاحقا"
          onClose={() => setOpenErrorUiDialog(false)}
          error={deleteArticleError || addNewArticleError || updateArticleError || toggleIsFeaturedStatusError}
        />
      )}

      {confirmState && (
        <ConfirmModal
          {...confirmState}
          onClose={close}
          loading={isDeleteingArticleLoading}
        />
      )}
      {detailArticle && (
        <ArticleDetailModal
          article={detailArticle}
          onClose={() => setDetailArticle(null)}
        />
      )}

      {formModal.open && (
        <ArticleFormModal
          mode={formModal.mode}
          article={formModal.article}
          onClose={() =>
            setFormModal({ open: false, mode: "add", article: null })
          }
          onSubmit={handleSubmit}
          isLoading={isAddingNewArticleLoading || isUpdateingArticleLoading}
        />
      )}

      <div className="flex flex-col gap-4 h-full">
        {/* PAGE HEADER */}
        <div className="flex flex-col items-end sm:items-start">
          <h1 className="text-primary font-black text-xl sm:text-2xl">
            إدارة المقالات
          </h1>
          <p className="text-gray-400 font-normal text-sm sm:text-base">
            إدارة المقالات على ميدي هب
          </p>
        </div>

        {/* STATS */}
        <div className="flex items-stretch justify-start gap-4 flex-wrap">
          {[
            {
              label: "إجمالي عدد المقالات",
              icon: <FileText size={20} className="text-primary" />,
              iconBg: "bg-background-primary",
              value: totalArticles,
              sub: `+${newArticlesThisMonth} أضيفة هذا الشهر`,
              subColor: "text-primary",
            },
            {
              label: "مقالات الإدارة",
              icon: <ShieldCheck size={20} className="text-primary" />,
              iconBg: "bg-background-primary",
              value: adminArticles,
              sub: `${adminArticlesPercentage}% من الإجمالي`,
              subColor: "text-[#005523]",
            },
            {
              label: "مقالات الأطباء",
              icon: <Stethoscope size={20} className="text-primary" />,
              iconBg: "bg-background-primary",
              value: doctorArticles,
              sub: `${doctorArticlesPercentage}% من الإجمالي`,
              subColor: "text-primary",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col p-3 gap-2 bg-white rounded-lg border-b-2 border-primary/20 min-w-[160px]">
              <div
                className={`flex w-full justify-between items-center ${s.label !== "إجمالي عدد المقالات" ? "gap-17" : "gap-9"}`}>
                <p className="text-gray-500 font-normal text-sm">{s.label}</p>
                <div
                  className={`flex items-center justify-center rounded-full ${s.iconBg} p-2 shrink-0`}>
                  {s.icon}
                </div>
              </div>
              <span className="font-black text-xl text-gray-700">
                {s.value}
              </span>
              <p className={`${s.subColor} font-normal text-sm`}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* FILTER BAR */}
        <div className="bg-white rounded-xl flex flex-col sm:flex-row justify-between gap-3 p-2 sm:p-3 items-stretch sm:items-center shadow-sm">
          {/* TABS */}
          <div className="flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={String(tab.value)}
                onClick={() => {
                  setActiveTab(tab.value);
                  setCurrentPage(1);
                }}
                className={`cursor-pointer flex-shrink-0 flex justify-center items-center font-normal py-2 px-3 rounded-lg text-sm transition-colors duration-150 ${
                  activeTab === tab.value
                    ? "bg-background-primary text-primary font-semibold"
                    : "text-gray-400 hover:bg-background-primary hover:text-primary"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* FILTERS + SEARCH + ADD */}
          <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
            {/* SPECIALITY DROPDOWN */}
            <div
              onClick={() => {
                setOpenSpecialityDropDown((p) => !p);
                setOpenCategoryDropDown(false);
              }}
              className="relative flex items-center gap-2 p-2 sm:p-3 bg-background-primary rounded-lg cursor-pointer text-sm shrink-0 select-none">
              <span className="text-primary text-sm max-w-[100px] truncate">
                {speciality}
              </span>
              <ChevronDown
                size={14}
                className={`text-primary transition-transform shrink-0 ${openSpecialityDropDown ? "rotate-180" : ""}`}
              />
              {openSpecialityDropDown && (
                <div className="absolute z-20 flex flex-col gap-1 bg-white shadow-lg border border-gray-100 p-2 top-11 left-0 rounded-xl min-w-[160px] max-h-[200px] overflow-y-auto no-scrollbar">
                  {["جميع التخصصات", ...SPECIALITIES].map((spe, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSpeciality(spe);
                        setOpenSpecialityDropDown(false);
                      }}
                      className="cursor-pointer text-right hover:bg-background-primary text-gray-400 hover:text-primary py-2 px-3 rounded-lg text-sm transition-colors">
                      {spe}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CATEGORY DROPDOWN */}
            <div
              onClick={() => {
                setOpenCategoryDropDown((p) => !p);
                setOpenSpecialityDropDown(false);
              }}
              className="relative flex items-center gap-2 p-2 sm:p-3 bg-background-primary rounded-lg cursor-pointer text-sm shrink-0 select-none">
              <span className="text-primary text-sm max-w-[100px] truncate">
                {category}
              </span>
              <ChevronDown
                size={14}
                className={`text-primary transition-transform shrink-0 ${openCategoryDropDown ? "rotate-180" : ""}`}
              />
              {openCategoryDropDown && (
                <div className="absolute z-20 flex flex-col gap-1 bg-white shadow-lg border border-gray-100 p-2 top-11 left-0 rounded-xl min-w-[160px] max-h-[200px] overflow-y-auto no-scrollbar">
                  {["جميع التصنيفات", ...ARTICLE_CATEGORIES].map((cat, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategory(cat);
                        setOpenCategoryDropDown(false);
                      }}
                      className="cursor-pointer text-right hover:bg-background-primary text-gray-400 hover:text-primary py-2 px-3 rounded-lg text-sm transition-colors">
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SEARCH */}
            <div className="flex items-center rounded-lg py-2 px-3 gap-2 bg-background-primary flex-1 min-w-[160px]">
              <Search size={15} className="text-primary shrink-0" />
              <input
                placeholder="ابحث عن مقال..."
                className="bg-transparent text-gray-600 font-normal text-xs sm:text-sm w-full outline-none placeholder:text-gray-400"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* ADD BUTTON */}
            <button
              disabled={isToggleIsFeaturedStatusLoading}
              onClick={() =>
                setFormModal({ open: true, mode: "add", article: null })
              }
              className="flex cursor-pointer items-center justify-center gap-2 bg-primary px-3 py-2.5 rounded-lg shrink-0 hover:bg-primary/90 transition-colors">
              <Plus size={18} className="text-white" />
              <span className="text-white text-sm font-semibold">
                إضافة مقال
              </span>
            </button>
          </div>
        </div>

        {/* ARTICLES LIST */}
        <div className="flex flex-col gap-3 flex-1">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl flex-1 flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center">
                  <FileText className="size-8 text-gray-200" />
                </div>
                <p className="text-gray-400 font-semibold text-sm">
                  {searchInput
                    ? "لا توجد مقالات مطابقة للبحث"
                    : "لا توجد مقالات"}
                </p>
                <p className="text-gray-300 text-xs">
                  {searchInput
                    ? "جرّب كلمة بحث مختلفة"
                    : "لم يتم إضافة أي مقالات بعد"}
                </p>
              </div>
            </div>
          ) : (
            filtered.map((a) => (
              <ArticleCard
                key={a._id}
                article={a}
                onEdit={() =>
                  setFormModal({ open: true, mode: "edit", article: a })
                }
                onDelete={() => handleDeleteArticle(a._id, a.title)}
                onDetail={() => setDetailArticle(a)}
                onToggle={() => handleToggleStatues(a._id)}
                isLoading={isToggleIsFeaturedStatusLoading || isDeleteingArticleLoading}
              />
            ))
          )}
        </div>

        {/* PAGINATION */}
        <div className="bg-white rounded-xl flex items-center justify-center gap-2 py-3 px-4 shadow-sm">
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="size-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
            <ChevronLeft size={15} />
          </button>

          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`size-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  currentPage === page
                    ? "bg-primary text-white"
                    : "border border-gray-200 text-gray-400 hover:border-primary hover:text-primary"
                }`}>
                {page}
              </button>
            ),
          )}

          {totalPages > 4 && <span className="text-gray-300 text-sm">...</span>}

          {totalPages > 3 && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`size-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                currentPage === totalPages
                  ? "bg-primary text-white"
                  : "border border-gray-200 text-gray-400 hover:border-primary hover:text-primary"
              }`}>
              {totalPages}
            </button>
          )}

          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="size-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </>
  );
}

export default ArticlesManagementPage;
