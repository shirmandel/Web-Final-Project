import { Router } from 'express';
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getPostsByUser,
} from '../controllers/post.controller';
import authMiddleware from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

const router = Router();

router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', authMiddleware, upload.single('image'), createPost);
router.put('/:id', authMiddleware, upload.single('image'), updatePost);
router.delete('/:id', authMiddleware, deletePost);
router.get('/user/:userId', authMiddleware, getPostsByUser);

export default router;
