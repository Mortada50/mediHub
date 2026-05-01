import React, { useState } from "react";
import {
  Stethoscope,
  Check,
  Ban,
  ChevronDown,
  Search,
  MessageSquareText,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SPECIALITIES, yemenGovernorates } from "../utils/constant";
import Avatar from "../components/Avatar.jsx";
import TableEmptyUI from "../components/TableEmptyUi";
import DoctorDetailModal from "../components/DoctorDetailModal.jsx";

// -------------API-----------
import { useUsers } from "../hooks/useUsers.js";
import { useDoctorPharmacy } from "../hooks/useDoctorPharmacy.js";

import PageLoader from "../components/PageLoader.jsx";
import TableErrorUI from "../components/TableErrorUi.jsx";
import { useConfirm } from "../hooks/useConfirm.js";
import ConfirmModal from "../components/ConfirmModal.jsx";
import ErrorUIDialog from "../components/ErrorUIDialog.jsx";

//  STATUS BADGE
const StatusBadge = ({ status }) => {
  if (status === "active")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#daf5ca] text-[#005523] whitespace-nowrap">
        نشط
      </span>
    );
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ffe5e5] text-[#b22f2f] whitespace-nowrap">
      موقوف
    </span>
  );
};

function DoctorsManagementPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [openCitiesDropDown, setOpenCitiesDropDown] = useState(false);
  const [openSpecialitiesDropDown, setOpenSpecialitiesDropDown] =
    useState(false);
  const [city, setCity] = useState("كل المدن");
  const [speciality, setSpeciality] = useState("جميع التخصصات");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openErrorUiDialog, setOpenErrorUiDialog] = useState(true);

  const { confirmState, confirm, close } = useConfirm();

  // modal useStates
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const { usersData, isLoading, isError, error, refetch, isFetching } =
    useUsers("doctor");
  const {
    ChangeApprovalStatusError,
    changeApprovalStatusMutation,
    isChangeApprovalStatusError,
    isChangeApprovalStatusLoadning,
  } = useDoctorPharmacy();

  const itemPerPage = 7;

  if (isLoading) return <PageLoader />;
  if (isError || !usersData) {
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
    totalUser,
    suspendedPercentage,
    suspendedUser,
    newUsersThisMonth,
    userList,
    activePercentage,
    activeUser,
  } = usersData;
  
  const allUsers = userList ?? [];

   const matchedUsers = allUsers.filter((u) => {
     const matchTab = activeTab === "all" || u.status === activeTab;
     const matchSearch =
       !searchInput ||
       u.fullName?.includes(searchInput) ||
       u.email?.includes(searchInput);
     const matchCity = city === "كل المدن" || u.address?.city === city;
     const matchSpeciality =
       speciality === "جميع التخصصات" || u.speciality === speciality;
     return matchTab && matchSearch && matchCity && matchSpeciality;
   });

   const totalPages = Math.max(1, Math.ceil(matchedUsers.length / itemPerPage));
   const safePage = Math.min(currentPage, totalPages);
   const filtered = matchedUsers.slice(
     (safePage - 1) * itemPerPage,
     safePage * itemPerPage,
   );

  const TABS = [
    { label: "كل الاطباء", value: "all" },
    {
      label: "نشط",
      value: "active",
    },
    {
      label: "موقوف",
      value: "suspended",
    },
  ];

  const handleToggleStatus = (_id, role, status, fullName) => {
    confirm({
      title: status === "suspended" ? "توقيف" : "تفعيل",
      message:
        status === "suspended"
          ? `هل أنت متأكد من انك تريد توقيف د/ ${fullName} `
          : `هل أنت متأكد من انك تريد تفعيل د/ ${fullName} `,
      variant: status === "suspended" ? "change" : "info",
      onConfirm: () => {
        changeApprovalStatusMutation(
          { _id, role, status },
          {
            onSuccess: () => {
              close();
              setSelectedDoctor(null);
            },
            onError: () => {
              close();
              setOpenErrorUiDialog(true);
            },
          },
        );
      },
    });
  };

  return (
    <>
      {isChangeApprovalStatusError && openErrorUiDialog && (
        <ErrorUIDialog
          title="حدث خطأ"
          message="تعذر تعديل حالة المستخدم يرجى المحاولة لاحقا"
          onClose={() => setOpenErrorUiDialog(false)}
          error={ChangeApprovalStatusError}
        />
      )}

      {confirmState && (
        <ConfirmModal
          {...confirmState}
          onClose={close}
          loading={isChangeApprovalStatusLoadning}
        />
      )}
      {selectedDoctor && (
        <DoctorDetailModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onToggleStatus={handleToggleStatus}
          isLoading={isChangeApprovalStatusLoadning}
        />
      )}
      <div className="flex flex-col gap-4 h-full">
        {/* PAGE HEADER */}
        <div className="flex flex-col items-end sm:items-start">
          <h1 className="text-primary font-black text-xl sm:text-2xl">
            إدارة الاطباء
          </h1>
          <p className="text-primary-400 font-normal text-sm sm:text-base">
            إدارة ومتابعة كادر الاطباء على ميدي هب
          </p>
        </div>
        {/* STATIS */}
        <div className="flex items-center justify-start gap-[16px]">
          <div className="flex flex-col p-3 gap-2 bg-white rounded-[6px] border border-white  border-b-primary/25">
            <div className="flex w-full justify-between items-center gap-9">
              <p className="text-gray-500 font-normal text-sm">
                إجمالي عدد الاطباء
              </p>
              <div className="flex items-center justify-center rounded-full bg-background-primary p-2">
                <Stethoscope size={20} className="text-primary" />
              </div>
            </div>
            <div>
              <span className="font-black text-xl text-gray-700">
                {totalUser}
              </span>
            </div>
            <div>
              <p className="text-primary font-normal text-sm">
                <span>+{newUsersThisMonth}</span> خلال هذا الشهر
              </p>
            </div>
          </div>
          <div className="flex flex-col p-3 gap-2 bg-white rounded-[6px] border border-white  border-b-primary/25">
            <div className="flex w-full justify-between items-center gap-22">
              <p className="text-gray-500 font-normal text-sm">نشطون</p>
              <div className="flex items-center justify-center rounded-full bg-[#daf5ca] p-2">
                <Check size={20} className="text-[#005523]" />
              </div>
            </div>
            <div>
              <span className="font-black text-xl text-gray-700">
                {activeUser}
              </span>
            </div>
            <div>
              <p className="text-[#005523] font-normal text-sm">
                <span>{activePercentage}%</span> من الاجمالي{" "}
              </p>
            </div>
          </div>
          <div className="flex flex-col p-3 gap-2 bg-white rounded-[6px] border border-white  border-b-primary/25">
            <div className="flex w-full justify-between items-center gap-22">
              <p className="text-gray-500 font-normal text-sm">موقوف</p>
              <div className="flex items-center justify-center rounded-full bg-[#ffe5e5] p-2">
                <Ban size={20} className="text-[#b22f2f]" />
              </div>
            </div>
            <div>
              <span className="font-black text-xl text-gray-700">
                {suspendedUser}
              </span>
            </div>
            <div>
              <p className="text-[#b22f2f] font-normal text-sm">
                <span>{suspendedPercentage}%</span> من الاجمالي{" "}
              </p>
            </div>
          </div>
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
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            {/* STATUS DROPDOWN */}
            <div
              onClick={() => {
                setOpenCitiesDropDown((p) => !p);
                setOpenSpecialitiesDropDown(false);
              }}
              className="relative flex items-center gap-2 p-2 sm:p-3 bg-background-primary rounded-lg cursor-pointer text-sm shrink-0 select-none">
              <span className="text-primary text-sm">{city}</span>
              <ChevronDown
                size={14}
                className={`text-primary transition-transform ${openCitiesDropDown ? "rotate-180" : ""}`}
              />
              {openCitiesDropDown && (
                <div className="absolute z-20 flex flex-col gap-1 bg-white shadow-lg border border-gray-100 p-2 top-11 left-0 rounded-xl min-w-[110px] h-[200px] overflow-scroll no-scrollbar">
                  {yemenGovernorates.map((city, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCity(city);
                        setOpenCitiesDropDown(false);
                      }}
                      className="cursor-pointer text-right hover:bg-background-primary text-gray-400 hover:text-primary py-2 px-3 rounded-lg text-sm transition-colors">
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* SPECIALITY DROPDOWN */}
            <div
              onClick={() => {
                setOpenSpecialitiesDropDown((p) => !p);
                setOpenCitiesDropDown(false);
              }}
              className="relative flex items-center gap-2 p-2 sm:p-3 bg-background-primary rounded-lg cursor-pointer text-sm shrink-0 select-none">
              <span className="text-primary text-sm">{speciality}</span>
              <ChevronDown
                size={14}
                className={`text-primary transition-transform ${openSpecialitiesDropDown ? "rotate-180" : ""}`}
              />
              {openSpecialitiesDropDown && (
                <div className="absolute z-20 flex flex-col gap-1 bg-white shadow-lg border border-gray-100 p-2 top-11 right-0 rounded-xl min-w-[150px] h-[200px] overflow-scroll no-scrollbar">
                  {SPECIALITIES.map((spec, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSpeciality(spec);
                        setOpenCitiesDropDown(false);
                        setOpenSpecialitiesDropDown(false);
                      }}
                      className="cursor-pointer text-right hover:bg-background-primary text-gray-400 hover:text-primary py-2 px-3 rounded-lg text-sm transition-colors">
                      {spec}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SEARCH */}
            <div className="flex items-center rounded-lg py-2 px-3 gap-2 bg-background-primary flex-1 min-w-0">
              <Search size={15} className="text-primary shrink-0" />
              <input
                placeholder="ابحث باسم الطبيب أو البريد الالكتروني"
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
                    بيانات الطبيب
                  </th>
                  <th className="py-3 px-4 font-semibold text-sm text-center">
                    التخصص
                  </th>
                  <th className="py-3 px-4 font-semibold text-sm text-center">
                    حالة الحساب
                  </th>
                  <th className="py-3 px-4 font-semibold text-sm text-center">
                    المدينة
                  </th>
                  <th className="py-3 px-4 font-semibold text-sm text-center">
                    سعر الحجز
                  </th>
                  <th className="py-3 px-4 font-semibold text-sm text-center rounded-tl-xl">
                    احداث
                  </th>
                </tr>
              </thead>
              <tbody>
                {isError ? (
                  <TableErrorUI
                    colSpan={6}
                    message={error?.message}
                    onRetry={() => refetch()}
                    onloading={isFetching}
                  />
                ) : filtered.length === 0 ? (
                  <TableEmptyUI
                    colSpan={6}
                    isSearching={!!searchInput}
                    message="لا  يوجد اطباء مطابقين للبحث"
                    messageSubTitle="حاول تعديل معايير البحث او ازالتها بالكامل"
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
                        {user.speciality}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">
                          <StatusBadge status={user.status} />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600 text-sm">
                        {user.address.city}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600 text-sm">
                        {user.appointmentFee
                          ? user.appointmentFee?.toLocaleString()
                          : "غير محدد"}{" "}
                        {user.appointmentFee ? "ريال" : ""}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* MoreHorizontal → opens modal */}
                          <button
                            onClick={() => setSelectedDoctor(user)}
                            className="p-1.5 rounded-lg hover:bg-background-primary text-gray-400 hover:text-primary transition-colors cursor-pointer">
                            <MoreHorizontal size={16} />
                          </button>
                          <button
                            // onClick={() => handleDeleteUser(user)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors cursor-pointer">
                            <MessageSquareText
                              size={16}
                              className="text-primary"
                            />
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

export default DoctorsManagementPage;
