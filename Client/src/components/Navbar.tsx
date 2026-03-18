import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Toolbar,
  Typography,
  Avatar,
  Box,
  IconButton,
  Tooltip,
  AppBar,
} from "@mui/material";
import {
  Home as HomeIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

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

  const navIconSx = (active: boolean) => ({
    color: active ? "primary.main" : "text.secondary",
    bgcolor: active ? "rgba(18, 153, 144, 0.1)" : "transparent",
    borderRadius: "10px",
    padding: "8px",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: "rgba(18, 153, 144, 0.08)",
      color: "primary.main",
      transform: "scale(1.08)",
    },
  });

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar
        sx={{
          justifyContent: "space-between",
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          py: 0.5,
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #129990 0%, #096B68 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              boxShadow: "0 3px 10px rgba(18, 153, 144, 0.35)",
            }}
          >
            ✦
          </Box>
          <Typography
            variant="h6"
            sx={{
              background: "linear-gradient(135deg, #129990 0%, #096B68 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              fontSize: "1.2rem",
            }}
          >
            InstaVibe
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Home">
            <IconButton onClick={() => navigate("/")} sx={navIconSx(isActive("/"))}>
              <HomeIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="New Post">
            <Box
              onClick={() => navigate("/create")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                mx: 0.5,
                px: 1.75,
                py: 0.75,
                borderRadius: "10px",
                background: isActive("/create")
                  ? "linear-gradient(135deg, #129990, #096B68)"
                  : "linear-gradient(135deg, #129990, #096B68)",
                color: "white",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontWeight: 700,
                boxShadow: "0 3px 12px rgba(18, 153, 144, 0.35)",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 5px 18px rgba(18, 153, 144, 0.45)",
                  transform: "translateY(-1px)",
                },
                userSelect: "none",
              }}
            >
              <AddIcon sx={{ fontSize: "1rem" }} />
              New Post
            </Box>
          </Tooltip>

          <Tooltip title="My Profile">
            <IconButton
              onClick={() => navigate(`/profile/${user?._id}`)}
              sx={{
                p: 0.5,
                ml: 0.5,
                transition: "transform 0.2s ease",
                "&:hover": { transform: "scale(1.08)" },
              }}
            >
              <Avatar
                src={getProfileImage()}
                sx={{
                  width: 34,
                  height: 34,
                  border: "2.5px solid",
                  borderColor: "primary.main",
                  fontSize: "0.9rem",
                  boxShadow: "0 2px 8px rgba(18, 153, 144, 0.25)",
                  transition: "box-shadow 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 14px rgba(18, 153, 144, 0.4)",
                  },
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              sx={{
                ...navIconSx(false),
                "&:hover": {
                  bgcolor: "rgba(211, 47, 47, 0.08)",
                  color: "error.main",
                  transform: "scale(1.08)",
                },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
