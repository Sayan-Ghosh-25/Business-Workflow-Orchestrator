// src/routes/notifications.ts
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { listNotifications, markNotificationRead, markAllRead } from "../controllers/notificationsController";

const router = express.Router();

router.get("/", authMiddleware, listNotifications);
router.post("/:id/read", authMiddleware, markNotificationRead);
router.post("/read-all", authMiddleware, markAllRead);

export default router;
