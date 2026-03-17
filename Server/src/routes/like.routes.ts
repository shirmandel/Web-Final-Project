import { Router } from 'express';
import { toggleLike, getLikeStatus } from '../controllers/like.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: Like management endpoints
 */

/**
 * @swagger
 * /api/likes/{postId}:
 *   post:
 *     summary: Toggle like on a post
 *     tags: [Likes]
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
 *         description: Like toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                   example: true
 *                 likesCount:
 *                   type: integer
 *                   example: 5
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:postId', authMiddleware, toggleLike);

/**
 * @swagger
 * /api/likes/{postId}/status:
 *   get:
 *     summary: Get like status for a post
 *     tags: [Likes]
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
 *         description: Like status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:postId/status', authMiddleware, getLikeStatus);

export default router;
