// src/routes/auth.ts
import express from "express";
import { signup, login, me, updateProfile } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.patch("/me", authMiddleware, updateProfile);

export default router;
