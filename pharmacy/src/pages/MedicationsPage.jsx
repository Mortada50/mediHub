import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, ChevronLeft, SlidersHorizontal, X, Tag, Trash2 } from 'lucide-react';
import UpdatePriceModal from '../components/UpdatePriceModal';
import { DRUGCATEGORIES, DRUGTYPES } from '../utils/constant';
import { useMedicines } from '../hooks/useMedicines';
import { useConfirm } from '../hooks/useConfirm';
import PageLoader from '../components/PageLoader';
import TableErrorUI from '../components/TableErrorUi';
import ConfirmModal from '../components/ConfirmModal';
import toast, { Toaster } from 'react-hot-toast';

// ─── Type badge colour map ───────────────────────────────────────────────────
const TYPE_COLOURS = {
  حبوب:   { bg: '#E8F8F5', text: '#2DB89E' },
  كبسولة: { bg: '#E8F0FE', text: '#4A7CF6' },
  حقن:    { bg: '#FFF3E0', text: '#E07B2C' },
  شراب:   { bg: '#FCE4EC', text: '#E0506E' },
  كريم:   { bg: '#F3E5F5', text: '#9C27B0' },
  نقط:    { bg: '#E0F7FA', text: '#00838F' },
  مرهم:   { bg: '#F9FBE7', text: '#7B9B00' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getAgeStr = (ageGroup) => {
  if (!ageGroup) return '-';
  if (typeof ageGroup === 'string') return ageGroup;
  if (ageGroup.type === 'جميع الأعمار') return 'جميع الأعمار';
  if (ageGroup.type === 'حد أدنى') return `+${ageGroup.minAge} سنة`;
  return `${ageGroup.minAge}-${ageGroup.maxAge} سنة`;
};

const getPagesArray = (current, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current > 2) pages.push(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(1, current - 1); i <= Math.min(total, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  if (current < total - 1) pages.push(total);
  return pages;
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function MedicationsPage() {
  const [selectedMedToUpdate, setSelectedMedToUpdate] = useState(null);

  const [currentPage, setCurrentPage]       = useState(1);
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('جميع التصنيفات');
  const [selectedType, setSelectedType]     = useState('جميع الأنواع');
  const [showFilters, setShowFilters]       = useState(false);

  const {
    myMedicinesData,
    isMyMedicinesLoading,
    isMyMedicinesError,
    myMedicinesError,
    refetchMyMedicines,
    isMyMedicinesFetching,
    removeMedicineMutation,
    isRemovingMedicine,
    updateMedicinePriceMutation,
    isUpdatingPrice
  } = useMedicines();

  const { confirmState, confirm, close } = useConfirm();

  const handleUpdatePrice = (medId, newPrice) => {
    updateMedicinePriceMutation(
      { medicineId: medId, price: newPrice },
      {
        onSuccess: () => {
          toast.success("تم تحديث السعر بنجاح");
          setSelectedMedToUpdate(null);
        },
        onError: (err) => {
          toast.error(err?.message || "حدث خطأ أثناء تحديث السعر");
        }
      }
    );
  };

  const handleDeleteMedicine = (medId) => {
    confirm({
      title: "إزالة الدواء",
      message: "هل أنت متأكد من أنك تريد إزالة هذا الدواء من صيدليتك؟",
      variant: "danger",
      onConfirm: () => {
        removeMedicineMutation(medId, {
          onSuccess: () => {
            toast.success("تم حذف الدواء بنجاح");
            close();
          },
          onError: (err) => {
            toast.error(err?.message || "حدث خطأ أثناء حذف الدواء");
            close();
          }
        });
      }
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedType]);

  const rawMedicines = myMedicinesData || [];

  /* ── Filtering ── */
  const filtered = rawMedicines.filter((pharmacyMed) => {
    const med = pharmacyMed.medicine; // the actual medicine details
    if (!med) return false;

    const matchSearch =
      med.englishName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.arabicName?.includes(searchQuery);
    const matchCat  = selectedCategory === 'جميع التصنيفات' || med.category === selectedCategory;
    const matchType = selectedType === 'جميع الأنواع' || med.type === selectedType;
    return matchSearch && matchCat && matchType;
  });

  /* ── Pagination ── */
  const ITEMS_PER_PAGE = 7;
  const totalPages   = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex   = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentMeds  = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1); };

  const hasActiveFilters =
    selectedCategory !== 'جميع التصنيفات' || selectedType !== 'جميع الأنواع';

  if (isMyMedicinesLoading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 pb-8 h-full" dir="rtl">
      <Toaster position="top-center" reverseOrder={false} />

      {/* ── Header ── */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-primary font-black text-xl sm:text-2xl">أدوية الصيدلية</h1>
        <p className="text-primary font-semibold text-xs sm:text-sm">
          الأدوية المتاحة في صيدليتك حالياً
        </p>
      </div>

      {/* ── Filters row ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">

          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary"
              size={17}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الدواء، عربي / إنجليزي"
              className="w-full h-[44px] bg-white rounded-xl pr-11 pl-4 text-sm text-text border border-primary/20 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`sm:hidden relative shrink-0 h-[44px] w-[44px] flex items-center justify-center rounded-xl border transition-colors cursor-pointer
              ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/20'}`}
          >
            {showFilters ? <X size={18} /> : <SlidersHorizontal size={18} />}
            {hasActiveFilters && !showFilters && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Desktop selects */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Category */}
            <div className="relative w-44">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-[44px] bg-white rounded-xl pr-4 pl-8 text-sm text-text border border-primary/20 focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer font-semibold"
              >
                {DRUGCATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={15} />
            </div>
            {/* Type */}
            <div className="relative w-36">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full h-[44px] bg-white rounded-xl pr-4 pl-8 text-sm text-text border border-primary/20 focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer font-semibold"
              >
                {DRUGTYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={15} />
            </div>
          </div>
        </div>

        {/* Mobile collapsible filters */}
        {showFilters && (
          <div className="sm:hidden flex flex-col gap-2 bg-white rounded-xl border border-primary/10 p-4 shadow-sm">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-[44px] bg-gray-50 rounded-xl pr-4 pl-8 text-sm text-text border border-primary/20 focus:outline-none appearance-none cursor-pointer font-semibold"
              >
                {DRUGCATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={15} />
            </div>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full h-[44px] bg-gray-50 rounded-xl pr-4 pl-8 text-sm text-text border border-primary/20 focus:outline-none appearance-none cursor-pointer font-semibold"
              >
                {DRUGTYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={15} />
            </div>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-primary/10 flex-1 flex flex-col overflow-hidden">

        {isMyMedicinesError ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <table className="w-full">
              <tbody className="flex items-center justify-center">
                <TableErrorUI
                  message={myMedicinesError?.message}
                  onRetry={refetchMyMedicines}
                  onloading={isMyMedicinesFetching}
                />
              </tbody>
            </table>
          </div>
        ) : currentMeds.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Search size={36} strokeWidth={1.5} className="opacity-40" />
            <p className="font-semibold text-sm">لا يوجد أدوية متاحة لعرضها</p>
          </div>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-sm text-right min-w-[800px]">
                <thead>
                  <tr style={{ background: '#55B1A5' }} className="text-white">
                    <th className="px-5 py-4 font-semibold text-right w-[22%]">الدواء</th>
                    <th className="px-4 py-4 font-semibold text-center">التصنيف</th>
                    <th className="px-4 py-4 font-semibold text-center">النوع</th>
                    <th className="px-4 py-4 font-semibold text-center">الفئة العمرية</th>
                    <th className="px-4 py-4 font-semibold text-center">المصنع/المنشأ</th>
                    <th className="px-4 py-4 font-semibold text-center">السعر</th>
                    <th className="px-4 py-4 font-semibold text-center">أحداث</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentMeds.map((pharmacyMed, idx) => {
                    const med = pharmacyMed.medicine;
                    return (
                      <tr
                        key={pharmacyMed._id}
                        className={`transition-colors ${idx % 2 === 0 ? 'bg-white hover:bg-gray-50/60' : 'bg-[#F0FAFA]/60 hover:bg-[#E8F7F5]/80'}`}
                      >
                        {/* Medication name + image */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3 justify-start">
                            <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                              <img
                                src={med.images?.[0] || 'https://cdn-icons-png.flaticon.com/128/4766/4766295.png'}
                                alt={med.englishName}
                                className="w-7 h-7 object-contain opacity-80"
                              />
                            </div>
                            <div className="flex flex-col min-w-0 text-right">
                              <span className="font-bold text-text text-[13px] leading-tight truncate" dir="ltr">
                                {med.englishName}
                              </span>
                              <span className="text-xs text-gray-400 mt-0.5 truncate">
                                {med.arabicName}
                              </span>
                            </div>
                            
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 text-center text-text font-semibold text-[13px]">
                          {med.category}
                        </td>

                        {/* Type badge */}
                        <td className="px-4 py-3 text-center">
                          <span
                            className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold"
                            style={{
                              background: TYPE_COLOURS[med.type]?.bg || '#E8F8F5',
                              color:      TYPE_COLOURS[med.type]?.text || '#2DB89E',
                            }}
                          >
                            {med.type}
                          </span>
                        </td>

                        {/* Age group */}
                        <td className="px-4 py-3 text-center text-text font-semibold text-[13px]">
                          {getAgeStr(med.ageGroup)}
                        </td>

                        {/* Manufacturer / Origin */}
                        <td className="px-4 py-3 text-center text-text font-semibold text-[13px]">
                          {med.origin}/{med.manufacturer}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 text-center text-text font-semibold text-[13px]">
                          {pharmacyMed.price} ريال
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {/* Edit */}
                            <button
                              onClick={() => setSelectedMedToUpdate({ ...med, price: pharmacyMed.price, pharmacyMedId: med._id })}
                              disabled={isRemovingMedicine}
                              aria-label="تعديل السعر"
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#4A7CF6]/30 bg-[#E8F0FE] text-[#4A7CF6] hover:bg-[#4A7CF6] hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Tag size={14} />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteMedicine(med._id)}
                              disabled={isRemovingMedicine}
                              aria-label="حذف"
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100">
              {currentMeds.map((pharmacyMed) => {
                const med = pharmacyMed.medicine;
                const tc = TYPE_COLOURS[med.type] || { bg: '#E8F8F5', text: '#2DB89E' };
                return (
                  <div
                    key={pharmacyMed._id}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <img
                        src={med.images?.[0] || 'https://cdn-icons-png.flaticon.com/128/4766/4766295.png'}
                        alt={med.englishName}
                        className="w-8 h-8 object-contain opacity-80"
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-bold text-text text-[13px] leading-tight truncate" dir="ltr">
                        {med.englishName}
                      </span>
                      <span className="text-xs text-gray-400 truncate">{med.arabicName}</span>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                          style={{ background: tc.bg, color: tc.text }}
                        >
                          {med.type}
                        </span>
                        <span className="text-[11px] text-gray-400 font-semibold">{med.category}</span>
                        <span className="text-[11px] text-gray-500 font-bold">{pharmacyMed.price} ريال</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => setSelectedMedToUpdate({ ...med, price: pharmacyMed.price, pharmacyMedId: med._id })}
                        disabled={isRemovingMedicine}
                        aria-label="تعديل السعر"
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#4A7CF6]/30 bg-[#E8F0FE] text-[#4A7CF6] hover:bg-[#4A7CF6] hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Tag size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(med._id)}
                        disabled={isRemovingMedicine}
                        aria-label="حذف"
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && !isMyMedicinesError && (
        <div className="flex items-center justify-center gap-1.5">
          {/* Prev */}
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>

          {/* Page numbers */}
          {getPagesArray(currentPage, totalPages).map((page, i) =>
            page === '...' ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors cursor-pointer
                  ${currentPage === page
                    ? 'bg-background-primary text-primary font-bold'
                    : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {page}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      )}

      {/* ── Update Price Modal ── */}
      <UpdatePriceModal 
        med={selectedMedToUpdate} 
        onClose={() => setSelectedMedToUpdate(null)} 
        onUpdate={handleUpdatePrice} 
        isLoading={isUpdatingPrice}
      />

      {/* ── Confirm Modal ── */}
      {confirmState && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.message}
          variant={confirmState.variant}
          onConfirm={confirmState.onConfirm}
          onClose={close}
          loading={isRemovingMedicine}
        />
      )}
    </div>
  );
}