import React, { useState } from "react";
import { ARTICLE_CATEGORIES } from "../utils/constant.js";
import { useArticles } from "../hooks/useArticle.js";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  MoreVertical,
  Plus,
  Search,
  SquarePen,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";
import mediHubLogo from "../assets/login-logo.png";
import ArticleDetailModal from "../components/ArticleDetailModal.jsx";
import PageLoader from "../components/PageLoader.jsx";
import ArticleFormModal from "../components/ArticleFormModal.jsx";
import TableErrorUI from "../components/TableErrorUi.jsx";
import ErrorUIDialog from "../components/ErrorUIDialog.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { useConfirm } from "../hooks/useConfirm.js";

function ArticlesManagementPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [openCategoryDropDown, setOpenCategoryDropDown] = useState(false);
  const [category, setCategory] = useState("جميع التصنيفات");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showArticleDetails, setShowArticledetails] = useState(null);
  const [formModal, setFormModal] = useState({
    open: false,
    mode: "add",
    article: null,
  });
  const [openErrorUiDialog, setOpenErrorUiDialog] = useState(true);
  const { confirmState, confirm, close } = useConfirm();

  const itemPerPage = 5;

  const {
    articles,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,

    addNewArticleMutation,
    isAddingNewArticleLoading,
    isAddingNewArticleError,
    addNewArticleError,

    updateArticleMutation,
    isUpdateingArticleLoading,
    isUpdateingArticleError,
    updateArticleError,

    deleteArticleMutation,
    isDeleteingArticleLoading,
    isDeleteingArticleError,
    deleteArticleError,
  } = useArticles();

  if (isLoading) return <PageLoader />;

  if (isError || !articles) {
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

  const articlesData = articles?.data;
  const allArticles = articlesData?.articles ?? [];

  const TABS = [
    { label: "كل المقالات", value: "all", count: articlesData?.totalArticles },
    {
      label: "المميزة",
      value: true,
      count: articlesData?.totalFeatureArticles,
    },
  ];

  const matchArticles = allArticles.filter((a) => {
    const matchTab = activeTab === "all" || a.isFeatured === activeTab;

    const matchSearch =
      !searchInput ||
      a.title?.includes(searchInput) ||
      a.description?.includes(searchInput);

    const matchCat = category === "جميع التصنيفات" || a.category === category;
    return matchTab && matchSearch && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(matchArticles.length / itemPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const filtered = matchArticles.slice(
    (safePage - 1) * itemPerPage,
    safePage * itemPerPage,
  );

  const handleSubmit = (data) => {
    if (data._id) {
      updateArticleMutation(data, {
        onSuccess: () =>
          setFormModal({ open: false, mode: "add", article: null }),
        onError: () => setOpenErrorUiDialog(true),
      });
    } else {
      addNewArticleMutation(data, {
        onSuccess: () =>
          setFormModal({ open: false, mode: "add", article: null }),
        onError: () => setOpenErrorUiDialog(true),
      });
    }
  };

  const handleDeleteArticle = (articleId, title) => {
    confirm({
      title: "حذف مقال",
      message: `هل أنت متأكد من انك تريد حذف المقالة '${title}' هذه العملية لا يمكن التراجع عنها`,
      variant: "danger",
      onConfirm: () => {
        deleteArticleMutation(articleId, {
          onSuccess: () => {
            close();
          },
          onError: () => {
            close();
            setOpenErrorUiDialog(true);
          },
        });
      },
    });
  };

  return (
    <>
      {(isAddingNewArticleError ||
        isUpdateingArticleError ||
        isDeleteingArticleError) &&
        openErrorUiDialog && (
          <ErrorUIDialog
            title="حدث خطأ"
            message={
              isAddingNewArticleError
                ? "تعذر اضافة المقالة يرجى المحاولة لاحقا"
                : isUpdateingArticleError
                  ? "تعذر تعديل هذه المقالة"
                  : "تعذر حذف هذه المقالة يرجى المحاولة لاحقا"
            }
            onClose={() => setOpenErrorUiDialog(false)}
            error={
              addNewArticleError || updateArticleError || deleteArticleError
            }
          />
        )}

      {showArticleDetails && (
        <ArticleDetailModal
          article={showArticleDetails}
          onClose={() => setShowArticledetails(null)}
        />
      )}

      {confirmState && (
        <ConfirmModal
          {...confirmState}
          onClose={close}
          loading={isDeleteingArticleLoading}
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
                {`${tab.label} (${tab.count})`}
              </button>
            ))}
          </div>

          {/* FILTERS + SEARCH + ADD */}
          <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
            {/* CATEGORY DROPDOWN */}
            <div
              onClick={() => {
                setOpenCategoryDropDown((p) => !p);
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
                onDetail={() => setShowArticledetails(a)}
                isLoading={isDeleteingArticleLoading}
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

function ArticleCard({ article, onEdit, onDelete, onDetail, isLoading }) {
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
            {
              <button
                disabled={isLoading}
                onClick={() => onEdit?.(article)}
                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-500 transition-colors cursor-pointer">
                <SquarePen size={15} />
              </button>
            }
            <button
              onClick={onDetail}
              className="p-1.5 rounded-lg hover:bg-background-primary text-gray-400 hover:text-gray-500 transition-colors cursor-pointer">
              <FileText size={15} />
            </button>
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

/* ── time ago helper ── */
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "منذ لحظات";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  return `منذ ${Math.floor(diff / 86400)} أيام`;
}
