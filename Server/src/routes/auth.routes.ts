import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  googleLogin,
} from "../controllers/auth.controller";
import upload from "../middleware/upload.middleware";

const router = Router();

router.post("/register", upload.single("profileImage"), register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/google", googleLogin);

export default router;
