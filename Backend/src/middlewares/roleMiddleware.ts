// src/middlewares/roleMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export function roleMiddleware(allowed: string[] = []) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "unauthorized" });
    const role = (user as any).role;
    if (!allowed.length || allowed.includes(role)) return next();
    return res.status(403).json({ error: "forbidden" });
  };
}
