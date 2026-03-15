import { Router } from "express";
import upload from "../middleware/upload.middleware";
import authMiddleware from "../middleware/auth.middleware";
import { getUserById, updateUser } from "../controllers/user.controller";

const router = Router();

router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, upload.single("image"), updateUser);

export default router;
