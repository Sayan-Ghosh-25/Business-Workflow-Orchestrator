"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const auth_1 = __importDefault(require("./routes/auth"));
const workflows_1 = __importDefault(require("./routes/workflows"));
const approvals_1 = __importDefault(require("./routes/approvals"));
const audit_1 = __importDefault(require("./routes/audit"));
const metrics_1 = __importDefault(require("./routes/metrics"));
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev"));
// Routes
app.get("/", (_req, res) => { res.send("Backend Running Successfully!"); });
app.use("/auth", auth_1.default);
app.use("/workflows", workflows_1.default);
app.use("/approvals", approvals_1.default);
app.use("/audit", audit_1.default);
app.use("/metrics", metrics_1.default);
// Health
app.get("/health", (_req, res) => res.json({ ok: true }));
// Error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map