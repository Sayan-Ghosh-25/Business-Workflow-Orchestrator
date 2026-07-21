// src/controllers/notificationsController.ts
import { Request, Response, NextFunction } from "express";
import { query } from "../services/dbService";
import { AuthRequest } from "../middlewares/authMiddleware";

/* GET /notifications
 * Query params: page, pageSize */
export async function listNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 50);
    const offset = (page - 1) * pageSize;

    const totalRes = await query(`SELECT count(*) FROM public.notifications WHERE user_id = $1`, [userId]);
    const total = Number(totalRes.rows[0]?.count || 0);

    const q = await query(
      `SELECT id, type, title, message, workflow_id, read, created_at FROM public.notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset]
    );

    // normalize columns for frontend: createdAt and payload shapes are okay
    const items = q.rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      message: r.message,
      workflowId: r.workflow_id,
      read: r.read,
      createdAt: r.created_at,
    }));

    res.json({ items, total });
  } catch (err) {
    next(err);
  }
}

/* POST /notifications/:id/read
 * Marks a single notification as read for the current user */
export async function markNotificationRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const r = await query(`UPDATE public.notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    if (r.rowCount === 0) return res.status(404).json({ error: "not found" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

/* POST /notifications/read-all
 * Marks all notifications for current user as read */
export async function markAllRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const r = await query(`UPDATE public.notifications SET read = true WHERE user_id = $1 AND read = false RETURNING id`, [userId]);
    res.json({ success: true, updated: r.rowCount || 0 });
  } catch (err) {
    next(err);
  }
}
