import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Home as HomeIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const getProfileImage = () => {
    if (!user?.profileImage) return undefined;
    if (user.profileImage.startsWith("http")) return user.profileImage;
    return `${API_URL}${user.profileImage}`;
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar
        sx={{
          justifyContent: "space-between",
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
        }}
      >
        <Typography
          variant="h5"
          onClick={() => navigate("/")}
          sx={(theme) => ({
            cursor: "pointer",
            background: `${theme.palette.primary.contrastText}`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800,
            letterSpacing: -0.5,
          })}
        >
          InstaVibe
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Home">
            <IconButton
              onClick={() => navigate("/")}
              sx={{
                color: isActive("/") ? "primary.main" : "primary.contrastText",
              }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="New Post">
            <IconButton
              onClick={() => navigate("/create")}
              sx={{
                color: isActive("/create")
                  ? "primary.main"
                  : "primary.contrastText",
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile">
            <IconButton onClick={() => navigate(`/profile/${user?._id}`)}>
              <Avatar
                src={getProfileImage()}
                sx={{
                  width: 32,
                  height: 32,
                  border: "2px solid",
                  borderColor: "primary.main",
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              sx={{ color: "primary.contrastText" }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
