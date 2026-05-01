import {
  Ban,
  Check,
  Stethoscope,
  Syringe,
  ClipboardList,
  TrendingUp,
  Search,
  ChevronDown,
  Plus,
  Trash2,
  SquarePen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useState } from "react";

import { DRUGCATEGORIES, DRUGTYPES } from "../utils/constant.js";
import AddMedicineModal from "../components/AddMedicineModal";

import TableEmptyUI from "../components/TableEmptyUi.jsx";
import TableErrorUI from "../components/TableErrorUi.jsx";

import { useMedicine } from "../hooks/useMedicines.js";
import ErrorUIDialog from "../components/ErrorUIDialog.jsx";
import PageLoader from "../components/PageLoader.jsx";
import { useConfirm } from "../hooks/useConfirm.js";
import ConfirmModal from "../components/ConfirmModal.jsx";



function MedicationManagementPage() {
  const [openCategoriesDropDown, setOpenCategoriesDropDown] = useState(false);
  const [category, setCategory] = useState("جميع التصنيفات");
  const [currentPage, setCurrentPage] = useState(1);

  const [openTypesDropDown, setOpenTypesDropDown] = useState(false);
  const [type, setType] = useState("جميع الأنواع");

  const [searchInput, setSearchInput] = useState("");
  // في الـ state:
  const [showAddModal, setShowAddModal] = useState(false);
  const [openErrorUiDialog, setOpenErrorUiDialog] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
   const { confirmState, confirm, close } = useConfirm();

  const {
    medicinesData,
    isLoading,
    isError, 
    error,
    refetch,
    isFetching,

    addNewMedicineError,
    addNewMedicineMutation,
    isAddNewMedicineError,
    isAddNewMedicineLoading,

    updateMedicineMutation,
    isupdateMedicineLoading,
    isupdateMedicineError,
    updateMedicineError,

    deleteMedicineMutation,
    isdeleteMedicineLoading,
    isdeleteMedicineError,
    deleteMedicineError


  } = useMedicine();

  if(isLoading || isupdateMedicineLoading) return <PageLoader /> ;
  
   if (isError || !medicinesData) {
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
  
  

  const itemPerPage = 7;

  const allMedications = medicinesData?.medicinesList ?? [];

  const matchedMedications = allMedications.filter((m) => {
    const matchSearch =
      !searchInput ||
      m.arabicName?.includes(searchInput) ||
      m.englishName?.toLowerCase().includes(searchInput.toLowerCase());
    const matchCategory =
      category === "جميع التصنيفات" || m.category === category;
    const matchType = type === "جميع الأنواع" || m.type === type;
    return matchCategory && matchSearch && matchType;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(matchedMedications.length / itemPerPage),
  );
  const safePage = Math.min(currentPage, totalPages);
  const filtered = matchedMedications.slice(
    (safePage - 1) * itemPerPage,
    safePage * itemPerPage,
  );

  // دالة الإضافة:
  const handleAddMedicine = (formData) => {
    
    addNewMedicineMutation(formData, {
      onSuccess: () => setShowAddModal(false),
      onError: () => setOpenErrorUiDialog(true),
    });

  };

  const handleUpdateMedicine = (formData) => {

    const imagesUrl = formData.images.filter((image) => image.file === null).map((image) => image.url )
    
    formData.imagesUrl = imagesUrl;
    const images = formData.images.filter((image) => image.file !== null)
    formData = {...formData, images}

    updateMedicineMutation(formData, {
     onSuccess: () => {
      setShowAddModal(false)
      setSelectedMedicine(null)
    },
     onError: () => setOpenErrorUiDialog(true),
   });
    
  }

  const handleDeleteMedicine = (medicineId, name) => {
     confirm({
       title: "حذف دواء",
       message: `هل أنت متأكد من انك تريد حذف دواء '${name}' هذه العملية لايمكن التراجع عنها`,
       variant: "danger",
       onConfirm: () => {
         deleteMedicineMutation(
            medicineId,
           {
             onSuccess: () => {
               close();
             },
             onError: () => {
               close();
               setOpenErrorUiDialog(true);
             },
           },
         );
       },
     });
  }

  return (
    <>
      {confirmState && (
        <ConfirmModal
          {...confirmState}
          onClose={close}
          loading={isdeleteMedicineLoading}
        />
      )}

      {(isAddNewMedicineError ||
        isupdateMedicineError ||
        isdeleteMedicineError) &&
        openErrorUiDialog && (
          <ErrorUIDialog
            title="حدث خطأ"
            message={
              isAddNewMedicineError
                ? addNewMedicineError?.message ||
                  "حدث خطأ غير متوقع أثناء إضافة الدواء"
                : updateMedicineError?.message ||
                  "حدث خطأ غير متوقع أثناء تعديل الدواء"
            }
            onClose={() => setOpenErrorUiDialog(false)}
            error={
              addNewMedicineError || updateMedicineError || deleteMedicineError
            }
          />
        )}

      {showAddModal && (
        <AddMedicineModal
          onClose={() => {
            setShowAddModal(false);
            setSelectedMedicine(null);
          }}
          onAddSubmit={handleAddMedicine}
          onUpdateSubmit={handleUpdateMedicine}
          isLoading={isAddNewMedicineLoading || isupdateMedicineLoading}
          onUpdate={selectedMedicine}
        />
      )}
      <div className="flex flex-col gap-4 h-full">
        {/* PAGE HEADER */}
        <div className="flex flex-col items-end sm:items-start">
          <h1 className="text-primary font-black text-xl sm:text-2xl">
            إدارة الأدوية
          </h1>
          <p className="text-primary-400 font-normal text-sm sm:text-base">
            إدارة ومتابعة الأدوية على ميدي هب
          </p>
        </div>
        {/* STATIS */}
        <div className="flex items-center justify-start gap-[16px]">
          <div className="flex flex-col p-3 gap-2 bg-white rounded-[6px] border border-white  border-b-primary/25">
            <div className="flex w-full justify-between items-center gap-9">
              <p className="text-gray-500 font-normal text-sm">
                إجمالي عدد الأدوية
              </p>
              <div className="flex items-center justify-center rounded-full bg-background-primary p-2">
                <Syringe size={20} className="text-primary" />
              </div>
            </div>
            <div>
              <span className="font-black text-xl text-gray-700">
                {medicinesData?.totalMedicines}
              </span>
            </div>
            <div>
              <p className="text-primary font-normal text-sm">على ميدي هب</p>
            </div>
          </div>
          <div className="flex flex-col p-3 gap-2 bg-white rounded-[6px] border border-white  border-b-primary/25">
            <div className="flex w-full justify-between items-center gap-9">
              <p className="text-gray-500 font-normal text-sm">
                يتتطلب وصفه طبية
              </p>
              <div className="flex items-center justify-center rounded-full bg-[#daf5ca] p-2">
                <ClipboardList size={20} className="text-[#005523]" />
              </div>
            </div>
            <div>
              <span className="font-black text-xl text-gray-700">
                {medicinesData?.numberOfMedicinesRequiringPrescription}
              </span>
            </div>
            <div>
              <p className="text-[#005523] font-normal text-sm">
                <span>
                  {medicinesData?.medicinesRequiringPrescriptionPercentage}%
                </span>{" "}
                من الاجمالي{" "}
              </p>
            </div>
          </div>
          <div className="flex flex-col p-3 gap-2 bg-white rounded-[6px] border border-white  border-b-primary/25">
            <div className="flex w-full justify-between items-center gap-14">
              <p className="text-gray-500 font-normal text-sm">
                أضيف هذا الشهر
              </p>
              <div className="flex items-center justify-center rounded-full bg-background-primary p-2">
                <TrendingUp size={20} className="text-[#005523]" />
              </div>
            </div>
            <div>
              <span className="font-black text-xl text-gray-700">
                {medicinesData?.newMedicinesThisMonth}
              </span>
            </div>
            <div>
              <p className="text-primary-400 font-normal text-sm">
                من الادوية{" "}
              </p>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white rounded-xl flex flex-col sm:flex-row justify-between gap-3 p-2 sm:p-3 items-stretch sm:items-center shadow-sm">
          <div className="flex gap-1 sm:gap-2 no-scrollbar">
            {/* CATEGORY DROPDOWN */}
            <div
              onClick={() => {
                setOpenCategoriesDropDown((p) => !p);
                setOpenTypesDropDown(false);
              }}
              className="relative flex items-center gap-2 p-2 sm:p-3 bg-background-primary rounded-lg cursor-pointer text-sm shrink-0 select-none">
              <span className="text-primary text-sm">{category}</span>
              <ChevronDown
                size={14}
                className={`text-primary transition-transform ${openCategoriesDropDown ? "rotate-180" : ""}`}
              />
              {openCategoriesDropDown && (
                <div className="absolute z-20 flex flex-col gap-1 bg-white shadow-lg border border-gray-100 p-2 top-11 left-0 rounded-xl min-w-[150px] h-[200px] overflow-scroll no-scrollbar">
                  {DRUGCATEGORIES.map((cat, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategory(cat);
                        setOpenCategoriesDropDown(false);
                      }}
                      className="cursor-pointer text-right hover:bg-background-primary text-gray-400 hover:text-primary py-2 px-3 rounded-lg text-sm transition-colors">
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* TYPE DROPDOWN */}
            <div
              onClick={() => {
                setOpenTypesDropDown((p) => !p);
                setOpenCategoriesDropDown(false);
              }}
              className="relative flex items-center gap-2 p-2 sm:p-3 bg-background-primary rounded-lg cursor-pointer text-sm shrink-0 select-none">
              <span className="text-primary text-sm">{type}</span>
              <ChevronDown
                size={14}
                className={`text-primary transition-transform ${openTypesDropDown ? "rotate-180" : ""}`}
              />
              {openTypesDropDown && (
                <div className="absolute z-20 flex flex-col gap-1 bg-white shadow-lg border border-gray-100 p-2 top-11 right-0 rounded-xl min-w-[150px] h-[200px] overflow-scroll no-scrollbar">
                  {DRUGTYPES.map((t, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setType(t);
                        setOpenTypesDropDown(false);
                      }}
                      className="cursor-pointer text-right hover:bg-background-primary text-gray-400 hover:text-primary py-2 px-3 rounded-lg text-sm transition-colors">
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {/* SEARCH */}
            <div className="flex items-center rounded-lg py-2 px-3 gap-2 bg-background-primary flex-1 min-w-0">
              <Search size={15} className="text-primary shrink-0" />
              <input
                placeholder="ابحث باسم الدواء، عربي، انجليزي..."
                className="bg-transparent text-gray-600 font-normal text-xs sm:text-sm w-full outline-none placeholder:text-gray-400"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  // setCurrentPage(1);
                }}
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex cursor-pointer items-center justify-center gap-2 bg-primary px-3 py-2 rounded-md">
              <Plus size={20} className="text-white" />
              <span className="text-white text-md"> إضافة دواء</span>
            </button>
          </div>
        </div>
        
        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1 no-scrollbar">
            <table className="w-full min-w-[600px] text-right">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="py-3 px-4 font-semibold text-sm text-right rounded-tr-xl">
                    الدواء
                  </th>
                  <th className="py-3 px-4 font-semibold text-sm text-start">
                    التصنيف
                  </th>
                  <th className="py-3 px-4 font-semibold text-sm text-start pr-7">
                    النوع
                  </th>
                  <th className="py-3 px-4 font-semibold text-sm text-start">
                    الفئة العمرية
                  </th>
                  <th className="py-3 px-4 font-semibold text-sm text-start">
                    التوافر
                  </th>
                  <th className="py-3 px-4 font-semibold text-sm text-center rounded-tl-xl">
                    احداث
                  </th>
                </tr>
              </thead>
              <tbody>
                {isError || !medicinesData ? (
                  <TableErrorUI
                    colSpan={6}
                    message={"error?.message"}
                    onRetry={() => refetch()}
                    onloading={isFetching}
                  />
                ) : filtered.length === 0 ? (
                  <TableEmptyUI
                    colSpan={6}
                    isSearching={!!searchInput}
                    message="لا  يوجد أدوية مطابقين للبحث"
                    messageSubTitle="حاول تعديل معايير البحث او ازالتها بالكامل"
                  />
                ) : (
                  filtered.map((m, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-gray-50 transition-colors hover:bg-primary/5 ${
                        idx % 2 === 1 ? "bg-background-primary/40" : "bg-white"
                      }`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Image medicine={m} />
                          <div className="flex flex-col items-start">
                            <span className="text-primary font-semibold text-sm">
                              {m.englishName} {m.concentration}
                            </span>
                            <span className="text-gray-400 text-xs" dir="ltr">
                              {m.arabicName} - {m.type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-start text-gray-600 text-sm">
                        {m.category}
                      </td>
                      <td className="py-3 px-4 text-start">
                        <div className="flex justify-start">
                          <span className="inline-flex items-start px-3 py-1 rounded-full text-xs font-semibold bg-[#daf5ca] text-[#005523] whitespace-nowrap">
                            {m.type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-start text-gray-600 text-sm">
                        {m.ageGroup.type === "جميع الأعمار"
                          ? "جميع الاعمار"
                          : m.ageGroup.type === "حد أدنى"
                            ? `+ ${m.ageGroup.minAge} سنوات`
                            : `من ${m.ageGroup.minAge} - ${m.ageGroup.maxAge} سنة`}
                      </td>
                      <td className="py-3 px-4 text-start text-gray-600 text-sm">
                        <StockBadge stock={m.stock} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* MoreHorizontal → opens modal */}
                          <button
                            onClick={() => {
                              setSelectedMedicine(m);
                              setShowAddModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[#dbeafe] text-[#2563eb]  transition-colors cursor-pointer">
                            <SquarePen size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteMedicine(m._id, m.arabicName)
                            }
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors cursor-pointer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* PAGINATION */}
          <div className="flex items-center justify-center gap-2 py-4 px-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="size-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
              <ChevronLeft size={15} />
            </button>

            {Array.from(
              { length: Math.min(3, totalPages) },
              (_, i) => i + 1,
            ).map((page) => (
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
            ))}

            {totalPages > 4 && (
              <span className="text-gray-300 text-sm">...</span>
            )}

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
      </div>
    </>
  );
}

export default MedicationManagementPage;

function Image({ medicine }) {
  if (medicine.images && medicine.images.length > 0) {
    return (
      <img
        src={medicine.images[0]}
        alt={medicine.arabicName}
        className="size-9 rounded-full object-cover shrink-0"
      />
    );
  }

  return (
    <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
      {medicine.englishName?.charAt(0)}
    </div>
  );
}

//  STOCK BADGE
const StockBadge = ({ stock }) => {
  if (stock > 0 && stock <= 5) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#fef3c7] text-[#d97706] whitespace-nowrap">
        {stock} صيدلية
      </span>
    );
  } else if (stock > 5) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#d1fae5] text-[#059669] whitespace-nowrap">
        {stock} صيدلية
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#fee2e2] text-[#dc2626] whitespace-nowrap">
      غير متوفر
    </span>
  );
};
