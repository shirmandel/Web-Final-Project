import { Router } from "express";
import {
  getCommentsByPost,
  createComment,
  deleteComment,
} from "../controllers/comment.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.get("/:postId", authMiddleware, getCommentsByPost);
router.post("/", authMiddleware, createComment);
router.delete("/:id", authMiddleware, deleteComment);

export default router;
