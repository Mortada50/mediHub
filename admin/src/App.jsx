import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";

import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import AdmissionsRegistrationPage from "./pages/AdmissionsRegistrationPage";
import DoctorsManagementPage from "./pages/DoctorsManagementPage";
import MedicationManagementPage from "./pages/MedicationManagementPage";
import PharmacyManagementPage from "./pages/PharmacyManagementPage";
import UsersManagementPage from "./pages/UsersManagementPage";
import ChatsPage from "./pages/ChatsPage";
import LoginPage from "./pages/LoginPage";
import ArticlesManagementPage from "./pages/ArticlesManagementPage";


function App() {

   const { isSignedIn, isLoaded } = useAuth();

   if (!isLoaded) return <h1>Loading...</h1>;

  return (
    <Routes>
      <Route
        path="/login"
        element={isSignedIn ? <Navigate to={"/dashboard"} /> : <LoginPage />}
      />

      <Route
        path="/"
        element={isSignedIn ? <DashboardLayout /> : <Navigate to={"/login"} />}>
        <Route index element={<Navigate to={"dashboard"} />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="admissions-registration"
          element={<AdmissionsRegistrationPage />}
        />
        <Route path="doctors-management" element={<DoctorsManagementPage />} />
        <Route
          path="medication-management"
          element={<MedicationManagementPage />}
        />
        <Route
          path="pharmacy-management"
          element={<PharmacyManagementPage />}
        />
        <Route path="users-management" element={<UsersManagementPage />} />
        <Route path="chats" element={<ChatsPage />} />
        <Route
          path="articles-management"
          element={<ArticlesManagementPage />}
        />
      </Route>
    </Routes>
  );
}

export default App;
