// src/controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../services/dbService";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is not defined");

type DbUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  password_hash?: string;
  preferences?: any;
  confidence_threshold?: number;
  created_at?: string;
};

function mapDbUserToApi(user: Partial<DbUserRow> | null) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    // map DB columns to frontend-friendly keys:
    notificationPrefs: user.preferences ?? {},
    confidenceThreshold: user.confidence_threshold ?? 85,
    createdAt: user.created_at ?? null,
  };
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email & password required" });

    const hashed = await bcrypt.hash(password, 10);
    const insert = `
      INSERT INTO public.users (name, email, password_hash, role, preferences, confidence_threshold, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,now())
      RETURNING id, name, email, role, preferences, confidence_threshold, created_at;
    `;
    const role = "user";
    const defaultPrefs = {};
    const defaultConfidence = Number(process.env.AI_AUTO_APPROVE_THRESHOLD_PERCENT || 85);
    const r = await query(insert, [name, email, hashed, role, JSON.stringify(defaultPrefs), defaultConfidence]);
    const userRow: DbUserRow = r.rows[0];
    const user = mapDbUserToApi(userRow);
    // Return created user (no token by default) — frontend may login automatically or redirect
    res.status(201).json({ success: true, user });
  } catch (err: any) {
    if ((err as any).code === "23505") return res.status(409).json({ error: "email already exists" });
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const r = await query(
      `SELECT id, name, email, role, password_hash, preferences, confidence_threshold, created_at
       FROM public.users WHERE email=$1 LIMIT 1`,
      [email]
    );
    const user: DbUserRow = r.rows[0];
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash || "");
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET as jwt.Secret, { expiresIn: "8h" });

    const apiUser = mapDbUserToApi(user);
    res.json({ token, user: apiUser });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    // authMiddleware sets req.user
    // @ts-ignore
    const payload = req.user;
    if (!payload || !payload.userId) return res.status(401).json({ error: "unauthorized" });

    const r = await query(
      `SELECT id, name, email, role, preferences, confidence_threshold, created_at
       FROM public.users WHERE id=$1 LIMIT 1`,
      [payload.userId]
    );
    const user: DbUserRow = r.rows[0];
    const apiUser = mapDbUserToApi(user);
    res.json(apiUser);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /auth/me
 * Body may include: { name?, preferences?, confidenceThreshold? }
 * Returns updated user object in the same API shape used elsewhere.
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    // @ts-ignore
    const payload = req.user;
    if (!payload || !payload.userId) return res.status(401).json({ error: "unauthorized" });

    const userId = payload.userId;
    const { name, preferences, confidenceThreshold } = req.body;

    // Build SET clauses dynamically
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (name !== undefined) {
      sets.push(`name = $${idx++}`);
      values.push(name);
    }
    if (preferences !== undefined) {
      sets.push(`preferences = $${idx++}`);
      values.push(preferences);
    }
    if (confidenceThreshold !== undefined) {
      sets.push(`confidence_threshold = $${idx++}`);
      values.push(Number(confidenceThreshold));
    }

    if (sets.length === 0) {
      // nothing to update; return current user
      const r = await query(`SELECT id, name, email, role, preferences, confidence_threshold, created_at FROM public.users WHERE id=$1`, [userId]);
      return res.json(mapDbUserToApi(r.rows[0]));
    }

    values.push(userId);
    const sql = `UPDATE public.users SET ${sets.join(",")}, updated_at = now() WHERE id = $${idx} RETURNING id, name, email, role, preferences, confidence_threshold, created_at;`;
    const r = await query(sql, values);
    const updated = r.rows[0];
    const apiUser = mapDbUserToApi(updated);
    res.json(apiUser);
  } catch (err) {
    next(err);
  }
}