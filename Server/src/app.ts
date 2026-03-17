import cors from "cors";
import path from "path";
import express from "express";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import likeRoutes from "./routes/like.routes";
import commentRoutes from "./routes/comment.routes";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use(express.static(path.join(__dirname, "../public")));

app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

export default app;
