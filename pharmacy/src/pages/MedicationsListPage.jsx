import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Eye, ChevronRight, ChevronLeft, SlidersHorizontal, X } from 'lucide-react';
import { DRUGCATEGORIES, DRUGTYPES } from '../utils/constant';
import MedicationModal from '../components/MedicationModal';
import { useMedicines } from '../hooks/useMedicines';
import PageLoader from '../components/PageLoader';
import TableErrorUI from '../components/TableErrorUi';
import toast, { Toaster } from 'react-hot-toast';

export default function MedicationsListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("جميع التصنيفات");
  const [selectedType, setSelectedType] = useState("جميع الأنواع");
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [selectedMed, setSelectedMed] = useState(null);
  const [isPricingMode, setIsPricingMode] = useState(false);
  const [medPrice, setMedPrice] = useState("");

  const {
    medicinesData,
    isMedicinesLoading,
    isMedicinesError,
    medicinesError,
    refetchMedicines,
    isMedicinesFetching,
    addMedicineMutation,
    isAddingMedicine,
  } = useMedicines();

  const allMedicines = medicinesData?.medicinesList || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedType]);

  const filteredMedications = allMedicines.filter(med => {
    const matchesSearch = med.englishName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          med.arabicName?.includes(searchQuery);
    const matchesCategory = selectedCategory === "جميع التصنيفات" || med.category === selectedCategory;
    const matchesType = selectedType === "جميع الأنواع" || med.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(filteredMedications.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMedications = filteredMedications.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1); };

  const handleAddMedicine = () => {
    if (!medPrice || isNaN(medPrice) || Number(medPrice) < 0) {
      toast.error("الرجاء إدخال سعر صحيح");
      return;
    }
    addMedicineMutation(
      { medicineId: selectedMed._id, price: Number(medPrice) },
      {
        onSuccess: () => {
          toast.success("تمت إضافة الدواء إلى صيدليتك بنجاح");
          setSelectedMed(null);
          setIsPricingMode(false);
          setMedPrice("");
        },
        onError: (err) => {
          toast.error(err.message || "حدث خطأ أثناء الإضافة");
        },
      }
    );
  };

  const getAgeStr = (ageGroup) => {
    if (typeof ageGroup === 'object') {
      if (ageGroup.type === 'جميع الأعمار') return 'جميع الأعمار';
      if (ageGroup.type === 'حد أدنى') return `+${ageGroup.minAge} سنة`;
      return `${ageGroup.minAge} - ${ageGroup.maxAge} سنة`;
    }
    return ageGroup;
  };

  const hasActiveFilters = selectedCategory !== "جميع التصنيفات" || selectedType !== "جميع الأنواع";

  if (isMedicinesLoading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 pb-8 h-full">
      <Toaster position="top-center" reverseOrder={false} />

      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-primary font-black text-xl sm:text-2xl">قائمة الأدوية</h1>
        <p className="text-primary font-semibold text-xs sm:text-sm">
          استعرض قاعدة بيانات الأدوية وأضف ما يتوفر في صيدليتك
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3">

        {/* Row 1: Search + toggle (mobile) / inline selects (desktop) */}
        <div className="flex items-center gap-2">

          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الدواء، عربي / إنجليزي"
              className="w-full h-[44px] bg-white rounded-xl pr-11 pl-4 text-sm text-text border border-primary/20 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Mobile: filter toggle button */}
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`sm:hidden relative shrink-0 h-[44px] w-[44px] flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/20'}`}
          >
            {showFilters ? <X size={18} /> : <SlidersHorizontal size={18} />}
            {hasActiveFilters && !showFilters && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Desktop: inline selects */}
          <div className="hidden sm:flex items-center gap-3">
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

        {/* Row 2: Mobile collapsible filter panel */}
        {showFilters && (
          <div className="sm:hidden flex flex-col gap-2 bg-white rounded-xl border border-primary/10 p-4 shadow-sm animate-[fadeIn_0.2s_ease-out]">
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

      {/* ── Table / Cards Area ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-primary/10 flex-1 flex flex-col overflow-hidden">

        {/* Error state */}
        {isMedicinesError ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <table className="w-full">
              <tbody className="flex items-center justify-center">
                <TableErrorUI
                  message={medicinesError?.message}
                  onRetry={refetchMedicines}
                  onloading={isMedicinesFetching}
                />
              </tbody>
            </table>
          </div>

        ) : currentMedications.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Search size={36} strokeWidth={1.5} className="opacity-40" />
            <p className="font-semibold text-sm">لا يوجد أدوية مطابقة للبحث</p>
          </div>

        ) : (
          <>
            {/* ── Desktop Table (md+) ── */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-sm text-right min-w-[700px]">
                <thead className="bg-[#55B1A5] text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-right w-1/4">الدواء</th>
                    <th className="px-4 py-4 font-semibold text-center">التصنيف</th>
                    <th className="px-4 py-4 font-semibold text-center">النوع</th>
                    <th className="px-4 py-4 font-semibold text-center">الفئة العمرية</th>
                    <th className="px-4 py-4 font-semibold text-center">المصنع</th>
                    <th className="px-4 py-4 font-semibold text-center">عرض</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentMedications.map((med) => (
                    <tr key={med._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                            <img
                              src={med.images?.[0] || "https://cdn-icons-png.flaticon.com/128/4766/4766295.png"}
                              alt={med.englishName}
                              className="w-7 h-7 object-contain opacity-80"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-text text-[13px] leading-tight truncate" dir="ltr">{med.englishName}</span>
                            <span className="text-xs text-gray-400 mt-0.5 truncate">{med.arabicName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-text font-semibold text-[13px]">{med.category}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-background-primary text-primary rounded-full text-xs font-bold">
                          {med.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-text font-semibold text-[13px]">{getAgeStr(med.ageGroup)}</td>
                      <td className="px-4 py-3 text-center text-text font-semibold text-[13px] max-w-[120px] truncate">{med.manufacturer}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => setSelectedMed(med)}
                            className="text-primary hover:text-primary/80 transition-colors p-2 rounded-full hover:bg-primary/5 cursor-pointer"
                          >
                            <Eye size={19} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards (< md) ── */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100">
              {currentMedications.map((med) => (
                <div
                  key={med._id}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/60 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <img
                      src={med.images?.[0] || "https://cdn-icons-png.flaticon.com/128/4766/4766295.png"}
                      alt={med.englishName}
                      className="w-8 h-8 object-contain opacity-80"
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-text text-[13px] leading-tight truncate" dir="ltr">{med.englishName}</span>
                    <span className="text-xs text-gray-400 truncate">{med.arabicName}</span>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-background-primary text-primary rounded-full text-[11px] font-bold">{med.type}</span>
                      <span className="text-[11px] text-gray-400 font-semibold">{med.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMed(med)}
                    className="shrink-0 w-9 h-9 flex items-center justify-center text-primary rounded-full hover:bg-primary/5 cursor-pointer transition-colors"
                  >
                    <Eye size={18} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Pagination ── */}
      {!isMedicinesError && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>

          {[...Array(totalPages)].map((_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer font-semibold ${currentPage === page ? 'bg-background-primary text-primary font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      )}

      {/* ── Medication Modal ── */}
      {selectedMed && (
        <MedicationModal
          med={selectedMed}
          onClose={() => {
            if (isAddingMedicine) return;
            setSelectedMed(null);
            setIsPricingMode(false);
            setMedPrice("");
          }}
          isPricingMode={isPricingMode}
          setIsPricingMode={setIsPricingMode}
          price={medPrice}
          setPrice={setMedPrice}
          isLoading={isAddingMedicine}
          onConfirmAdd={handleAddMedicine}
        />
      )}
    </div>
  );
}
