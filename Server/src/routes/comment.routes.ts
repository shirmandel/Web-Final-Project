import { Router } from "express";
import {
  getCommentsByPost,
  createComment,
  deleteComment,
} from "../controllers/comment.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management endpoints
 */

/**
 * @swagger
 * /api/comments/{postId}:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/:postId", authMiddleware, getCommentsByPost);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - postId
 *             properties:
 *               content:
 *                 type: string
 *                 example: Great post!
 *               postId:
 *                 type: string
 *                 example: 665a1b2c3d4e5f6a7b8c9d0e
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Content and postId are required
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, createComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comment deleted successfully.
 *       403:
 *         description: You can only delete your own comments
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, deleteComment);

export default router;
