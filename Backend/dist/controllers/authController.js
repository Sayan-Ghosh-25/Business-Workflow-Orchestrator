"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.me = me;
exports.updateProfile = updateProfile;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbService_1 = require("../services/dbService");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET)
    throw new Error("JWT_SECRET environment variable is not defined");
function mapDbUserToApi(user) {
    if (!user)
        return null;
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
async function signup(req, res, next) {
    try {
        const { name, email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "email & password required" });
        const hashed = await bcrypt_1.default.hash(password, 10);
        const insert = `
      INSERT INTO public.users (name, email, password_hash, role, preferences, confidence_threshold, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,now())
      RETURNING id, name, email, role, preferences, confidence_threshold, created_at;
    `;
        const role = "user";
        const defaultPrefs = {};
        const defaultConfidence = Number(process.env.AI_AUTO_APPROVE_THRESHOLD_PERCENT || 85);
        const r = await (0, dbService_1.query)(insert, [name, email, hashed, role, JSON.stringify(defaultPrefs), defaultConfidence]);
        const userRow = r.rows[0];
        const user = mapDbUserToApi(userRow);
        // Return created user (no token by default) — frontend may login automatically or redirect
        res.status(201).json({ success: true, user });
    }
    catch (err) {
        if (err.code === "23505")
            return res.status(409).json({ error: "email already exists" });
        next(err);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const r = await (0, dbService_1.query)(`SELECT id, name, email, role, password_hash, preferences, confidence_threshold, created_at
       FROM public.users WHERE email=$1 LIMIT 1`, [email]);
        const user = r.rows[0];
        if (!user)
            return res.status(401).json({ error: "invalid credentials" });
        const ok = await bcrypt_1.default.compare(password, user.password_hash || "");
        if (!ok)
            return res.status(401).json({ error: "invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
        const apiUser = mapDbUserToApi(user);
        res.json({ token, user: apiUser });
    }
    catch (err) {
        next(err);
    }
}
async function me(req, res, next) {
    try {
        // authMiddleware sets req.user
        // @ts-ignore
        const payload = req.user;
        if (!payload || !payload.userId)
            return res.status(401).json({ error: "unauthorized" });
        const r = await (0, dbService_1.query)(`SELECT id, name, email, role, preferences, confidence_threshold, created_at
       FROM public.users WHERE id=$1 LIMIT 1`, [payload.userId]);
        const user = r.rows[0];
        const apiUser = mapDbUserToApi(user);
        res.json(apiUser);
    }
    catch (err) {
        next(err);
    }
}
/**
 * PATCH /auth/me
 * Body may include: { name?, preferences?, confidenceThreshold? }
 * Returns updated user object in the same API shape used elsewhere.
 */
async function updateProfile(req, res, next) {
    try {
        // @ts-ignore
        const payload = req.user;
        if (!payload || !payload.userId)
            return res.status(401).json({ error: "unauthorized" });
        const userId = payload.userId;
        const { name, preferences, confidenceThreshold } = req.body;
        // Build SET clauses dynamically
        const sets = [];
        const values = [];
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
            const r = await (0, dbService_1.query)(`SELECT id, name, email, role, preferences, confidence_threshold, created_at FROM public.users WHERE id=$1`, [userId]);
            return res.json(mapDbUserToApi(r.rows[0]));
        }
        values.push(userId);
        const sql = `UPDATE public.users SET ${sets.join(",")}, updated_at = now() WHERE id = $${idx} RETURNING id, name, email, role, preferences, confidence_threshold, created_at;`;
        const r = await (0, dbService_1.query)(sql, values);
        const updated = r.rows[0];
        const apiUser = mapDbUserToApi(updated);
        res.json(apiUser);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=authController.js.map