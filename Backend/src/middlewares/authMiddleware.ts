// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

export interface AuthRequest extends Request {
  user?: any;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "authorization header missing" });
  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "invalid authorization header" });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET as jwt.Secret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
}
