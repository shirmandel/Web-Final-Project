import cors from "cors";
import express from "express";
import routes from "./routes/index";
import authRoutes from "./routes/auth.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routes);
app.use("/api/auth", authRoutes);

export default app;
