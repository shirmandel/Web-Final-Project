import React from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  TipsAndUpdates as TipIcon,
} from "@mui/icons-material";

interface SearchSidebarProps {
  searchQuery: string;
  activeSearch: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const SEARCH_TIPS = [
  "Try searching by topic",
  "Search for a username",
  "Use keywords from the post",
];

const SearchSidebar: React.FC<SearchSidebarProps> = ({
  searchQuery,
  activeSearch,
  onQueryChange,
  onSearch,
  onClear,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: "sticky",
        top: 80,
        p: 4,
        minHeight: '85vh',
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(200, 232, 229, 0.8)",
        borderRadius: "18px",
        boxShadow: "0 4px 28px rgba(13, 53, 51, 0.08)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "9px",
            background: "linear-gradient(135deg, #129990, #096B68)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(18,153,144,0.3)",
            flexShrink: 0,
          }}
        >
          <SearchIcon sx={{ color: "white", fontSize: "1rem" }} />
        </Box>
        <Typography
          variant="subtitle1"
          fontWeight={800}
          sx={{
            background: "linear-gradient(135deg, #129990, #096B68)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.01em",
          }}
        >
          Search Posts
        </Typography>
      </Box>

      <TextField
        fullWidth
        placeholder="Search posts..."
        value={searchQuery}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          mb: 1.5,
          "& .MuiOutlinedInput-root": {
            background: "rgba(240, 250, 249, 0.8)",
            borderRadius: "14px",
            fontSize: "0.92rem",
            "& fieldset": { borderColor: "rgba(144, 209, 202, 0.6)" },
            "&:hover fieldset": { borderColor: "primary.main" },
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(18, 153, 144, 0.12)",
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "text.secondary", fontSize: "1.1rem" }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={onClear}
                sx={{ color: "text.secondary", p: 0.5 }}
              >
                <CloseIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={onSearch}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: "9px",
                  p: 0.5,
                  ml: 0.25,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <SearchIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Active search chip */}
      {activeSearch && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
            Showing results for:
          </Typography>
          <Chip
            label={`"${activeSearch}"`}
            onDelete={onClear}
            color="primary"
            size="small"
            sx={{ fontWeight: 700, maxWidth: "100%" }}
          />
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
          <TipIcon sx={{ fontSize: "0.95rem", color: "primary.main" }} />
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.68rem" }}>
            Search Tips
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {SEARCH_TIPS.map((tip) => (
            <Box
              key={tip}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.25,
                py: 1.2,
                borderRadius: "10px",
                background: "rgba(18,153,144,0.05)",
                border: "1px solid rgba(144,209,202,0.25)",
                cursor: "default",
              }}
            >
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem", lineHeight: 1.4 }}>
                {tip}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default SearchSidebar;
