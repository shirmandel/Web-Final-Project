import React from "react";
import { Box } from "@mui/material";
import FeedPage from "./pages/FeedPage";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import { useAuth } from "./context/AuthContext";
import EditPostPage from "./pages/EditPostPage";
import EditProfilePage from "./pages/EditProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.paper" }}>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <EditPostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
