import React, { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ChatsPage from "./pages/ChatsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PageLoader from "./components/PageLoader";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";
import PendingRejectPage from "./pages/PendingRejectPage";
import PharmacyInfoPage from "./pages/PharmacyInfoPage";
import Schedulepage from "./pages/Schedulepage";
import MedicationsPage from "./pages/MedicationsPage";
import MedicationsListPage from "./pages/MedicationsListPage";
import { setAuthToken } from "./lib/axios";

function App() {
  const { isSignedIn, isLoaded, getToken } = useAuth();

  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    setAuthToken(getToken);
  }, [getToken]);

  if (!isLoaded || !userLoaded) return <PageLoader />;

  const status = user?.publicMetadata?.status;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isSignedIn ? (
            status === "pending" || status === "rejected" ? (
              <Navigate to={"/pending-page"} />
            ) : (
              <Navigate to={"/dashboard"} />
            )
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/forget-password"
        element={
          !isSignedIn ? <ForgetPasswordPage /> : <Navigate to={"/dashboard"} />
        }
      />
      <Route
        path="/pharmacy-registration"
        element={
          !isSignedIn || (isSignedIn && status === "rejected") ? (
            <RegisterPage />
          ) : (
            <Navigate to={"/dashboard"} />
          )
        }
      />

      <Route
        path="/pending-page"
        element={
          isSignedIn && (status === "pending" || status === "rejected") ? (
            <PendingRejectPage />
          ) : (
            <Navigate to={"/login"} />
          )
        }
      />

      <Route
        path="/"
        element={
          isSignedIn && (status === "active" || status === "suspended") ? (
            <DashboardLayout />
          ) : localStorage.getItem("url") ? (
            <Navigate to={"/forget-password"} />
          ) : (
            <Navigate to={"/login"} />
          )
        }>
        <Route index element={<Navigate to={"dashboard"} />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="pharmacy-info" element={<PharmacyInfoPage />} />
        <Route path="schedule" element={<Schedulepage />} />
        <Route path="medications" element={<MedicationsPage />} />
        <Route path="medications-list" element={<MedicationsListPage />} />
        <Route path="chats" element={<ChatsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
