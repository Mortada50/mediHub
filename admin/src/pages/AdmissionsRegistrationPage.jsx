import React, { useState } from "react";
import {
  ChevronDown,
  Search,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDoctorPharmacy } from "../hooks/useDoctorPharmacy.js";
import PageLoader from "../components/PageLoader.jsx";
import UserDetailModal from "../components/UserDetailModal.jsx";
import TableErrorUI from "../components/TableErrorUi.jsx";
import TableEmptyUI from "../components/TableEmptyUi.jsx";

// Confirm messages
import { useConfirm } from "../hooks/useConfirm";
import ConfirmModal from "../components/ConfirmModal";

/* ─────────────────────────────────────────── */
/*  STATUS BADGE                               */
/* ─────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  if (status === "pending")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 whitespace-nowrap">
        معلق
      </span>
    );
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-500 whitespace-nowrap">
      مرفوض
    </span>
  );
};

/* ─────────────────────────────────────────── */
/*  AVATAR                                     */
/* ─────────────────────────────────────────── */
const Avatar = ({ user }) => {
  if (user.avatar)
    return (
      <img
        src={user.avatar}
        alt={user.fullName}
        className="size-9 rounded-full object-cover shrink-0"
      />
    );
  return (
    <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
      {user.fullName?.charAt(0)}
    </div>
  );
};



/* ─────────────────────────────────────────── */
/*  MAIN PAGE                                  */
/* ─────────────────────────────────────────── */
function AdmissionsRegistrationPage() {
  const {
    DoctorsPharmaciesData,
    refetchDcotorsPharmaciesData,
    isReFetchingDcotorsPharmaciesData,
    DoctorsPharmaciesError,
    isDoctorsPharmaciesError,
    isDoctorsPharmaciesLoading,
    ChangeApprovalStatusError,
    changeApprovalStatusMutation,
    isChangeApprovalStatusError,
    isChangeApprovalStatusLoadning,
    deleteRejectedUserError,
    deleteRejectedUserMutation,
    isDeleteRejectedUserError,
    isDeleteRejectedUserLoading
  } = useDoctorPharmacy();

  const [openStatusDropDown, setOpenStatusDropDown] = useState(false);
  const [status, setStatus] = useState("all-status");
  const [activeTab, setActiveTab] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openErrorUiDialog, setOpenErrorUiDialog] = useState(true);
   const { confirmState, confirm, close } = useConfirm();

  const itemPerPage = 7;

  if (isDoctorsPharmaciesLoading) return <PageLoader />;
  if (isDoctorsPharmaciesError) {
    console.log(DoctorsPharmaciesError);
  }

  const allUsers = DoctorsPharmaciesData.users;
  
  const tabUsers =
    activeTab === "doctor"
      ? allUsers.filter((u) => u.role === "doctor")
      : activeTab === "pharmacy"
        ? allUsers.filter((u) => u.role === "pharmacy")
        : allUsers;

  const totalPages = Math.ceil(tabUsers.length / itemPerPage);

  const paged = searchInput
    ? allUsers
    : tabUsers.slice(
        (currentPage - 1) * itemPerPage,
        currentPage * itemPerPage,
      );

  const filtered = paged.filter((u) => {
    const matchSearch =
      !searchInput ||
      u.fullName.includes(searchInput) ||
      u.email.includes(searchInput);
    const matchStatus = status === "all-status" || u.status === status;
    return matchSearch && matchStatus;
  });

  const statusLabel =
    status === "all-status" ? "الكل" : status === "rejected" ? "مرفوض" : "معلق";

  const TABS = [
    { label: "كل المستخدمين", count: allUsers.length, value: "all" },
    {
      label: "الأطباء",
      count: allUsers.filter((u) => u.role === "doctor").length,
      value: "doctor",
    },
    {
      label: "الصيدليات",
      count: allUsers.filter((u) => u.role === "pharmacy").length,
      value: "pharmacy",
    },
  ];

  const handleApprove = (_id, role, status) => {
     
    changeApprovalStatusMutation({_id, role, status},{
      onSuccess: () => setSelectedUser(null),
      onError: () => setOpenErrorUiDialog(true)
    
    } );
  }

  const handleDeleteUser = ({_id, role, fullName}) => {
    confirm({
      title: "حذف المستخدم",
      message: `هل أنت متأكد من حذف "${fullName}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      variant: "danger",
      onConfirm: () =>
        deleteRejectedUserMutation(
          { _id, role },
          {
            onSuccess: () => close(),
          },
        ),
    });
  }
  
  
   return (
     <>
       {confirmState && (
         <ConfirmModal
           {...confirmState}
           onClose={close}
           loading={isDeleteRejectedUserLoading}
         />
       )}
       {/* MODAL */}
       {selectedUser && (
         <UserDetailModal
           user={selectedUser}
           onClose={() => setSelectedUser(null)}
           onApprove={handleApprove}
           isLoading={isChangeApprovalStatusLoadning}
           isError={isChangeApprovalStatusError}
           Error={ChangeApprovalStatusError}
           openErrorUiDialog={openErrorUiDialog}
           setOpenErrorUiDialog={setOpenErrorUiDialog}

         />
       )}

       <div className="flex flex-col gap-4 h-full">
         {/* PAGE HEADER */}
         <div className="flex flex-col items-end sm:items-start">
           <h1 className="text-primary font-black text-xl sm:text-2xl">
             إدارة طلبات التسجيل
           </h1>
           <p className="text-primary-400 font-normal text-sm sm:text-base">
             مراجعة وقبول أو رفض الكوادر الطبية الجديدة
           </p>
         </div>

         {/* FILTER BAR */}
         <div className="bg-white rounded-xl flex flex-col sm:flex-row justify-between gap-3 p-2 sm:p-3 items-stretch sm:items-center shadow-sm">
           <div className="flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
             {TABS.map((tab) => (
               <button
                 key={tab.value}
                 onClick={() => {
                   setActiveTab(tab.value);
                   setCurrentPage(1);
                 }}
                 className={`cursor-pointer flex-shrink-0 flex justify-center items-center font-normal py-2 px-3 rounded-lg text-sm transition-colors duration-150 ${
                   activeTab === tab.value
                     ? "bg-background-primary text-primary font-semibold"
                     : "text-gray-400 hover:bg-background-primary hover:text-primary"
                 }`}>
                 {tab.label} <span className="mr-1">({tab.count})</span>
               </button>
             ))}
           </div>

           <div className="flex gap-2 items-center">
             {/* STATUS DROPDOWN */}
             <div
               onClick={() => setOpenStatusDropDown((p) => !p)}
               className="relative flex items-center gap-2 p-2 sm:p-3 bg-background-primary rounded-lg cursor-pointer text-sm shrink-0 select-none">
               <span className="text-primary text-sm">{statusLabel}</span>
               <ChevronDown
                 size={14}
                 className={`text-primary transition-transform ${openStatusDropDown ? "rotate-180" : ""}`}
               />
               {openStatusDropDown && (
                 <div className="absolute z-20 flex flex-col gap-1 bg-white shadow-lg border border-gray-100 p-2 top-11 left-0 rounded-xl min-w-[110px]">
                   {[
                     { val: "all-status", label: "الكل" },
                     { val: "rejected", label: "مرفوض" },
                     { val: "pending", label: "معلق" },
                   ].map((opt) => (
                     <button
                       key={opt.val}
                       onClick={(e) => {
                         e.stopPropagation();
                         setStatus(opt.val);
                         setOpenStatusDropDown(false);
                       }}
                       className="cursor-pointer text-right hover:bg-background-primary text-gray-400 hover:text-primary py-2 px-3 rounded-lg text-sm transition-colors">
                       {opt.label}
                     </button>
                   ))}
                 </div>
               )}
             </div>

             {/* SEARCH */}
             <div className="flex items-center rounded-lg py-2 px-3 gap-2 bg-background-primary flex-1 min-w-0">
               <Search size={15} className="text-primary shrink-0" />
               <input
                 placeholder="ابحث باسم المستخدم أو البريد الالكتروني"
                 className="bg-transparent text-gray-600 font-normal text-xs sm:text-sm w-full outline-none placeholder:text-gray-400"
                 value={searchInput}
                 onChange={(e) => {
                   setSearchInput(e.target.value);
                   setCurrentPage(1);
                 }}
               />
             </div>
           </div>
         </div>

         {/* TABLE */}
         <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
           <div className="overflow-x-auto flex-1 no-scrollbar">
             <table className="w-full min-w-[600px] text-right">
               <thead>
                 <tr className="bg-primary text-white">
                   <th className="py-3 px-4 font-semibold text-sm text-right rounded-tr-xl">
                     بيانات المستخدم
                   </th>
                   <th className="py-3 px-4 font-semibold text-sm text-center">
                     نوع الحساب
                   </th>
                   <th className="py-3 px-4 font-semibold text-sm text-center">
                     حالة الحساب
                   </th>
                   <th className="py-3 px-4 font-semibold text-sm text-center">
                     رقم الهاتف
                   </th>
                   <th className="py-3 px-4 font-semibold text-sm text-center rounded-tl-xl">
                     احداث
                   </th>
                 </tr>
               </thead>
               <tbody>
                 {DoctorsPharmaciesError ? (
                   <TableErrorUI
                     colSpan={5}
                     message={DoctorsPharmaciesError?.message}
                     onRetry={() => refetchDcotorsPharmaciesData()}
                     onloading={isReFetchingDcotorsPharmaciesData}
                   />
                 ) : filtered.length === 0 ? (
                   <TableEmptyUI
                     colSpan={5}
                     isSearching={!!searchInput}
                     message="لا توجد طلبات انظمام حديثة"
                     messageSubTitle="ستظهر طلبات الانظمام هنا!"
                   />
                 ) : (
                   filtered.map((user, idx) => (
                     <tr
                       key={user._id}
                       className={`border-b border-gray-50 transition-colors hover:bg-primary/5 ${
                         idx % 2 === 1 ? "bg-background-primary/40" : "bg-white"
                       }`}>
                       <td className="py-3 px-4">
                         <div className="flex items-center gap-3">
                           <Avatar user={user} />
                           <div className="flex flex-col items-start">
                             <span className="text-primary font-semibold text-sm">
                               {user.fullName}
                             </span>
                             <span className="text-gray-400 text-xs" dir="ltr">
                               {user.email}
                             </span>
                           </div>
                         </div>
                       </td>
                       <td className="py-3 px-4 text-center text-gray-600 text-sm">
                         {user.role === "doctor" ? "طبيب" : "صيدلية"}
                       </td>
                       <td className="py-3 px-4 text-center">
                         <div className="flex justify-center">
                           <StatusBadge status={user.status} />
                         </div>
                       </td>
                       <td
                         className="py-3 px-4 text-center text-gray-600 text-sm"
                         dir="ltr">
                         {user.phone}
                       </td>
                       <td className="py-3 px-4">
                         <div className="flex items-center justify-center gap-2">
                           {user.status === "rejected" && (
                             <button
                               onClick={() => handleDeleteUser(user)}
                               className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors cursor-pointer">
                               <Trash2 size={16} />
                             </button>
                           )}
                           {/* MoreHorizontal → opens modal */}
                           <button
                             onClick={() => setSelectedUser(user)}
                             className="p-1.5 rounded-lg hover:bg-background-primary text-gray-400 hover:text-primary transition-colors cursor-pointer">
                             <MoreHorizontal size={16} />
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

export default AdmissionsRegistrationPage;
