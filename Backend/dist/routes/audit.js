"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/audit.ts
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const auditController_1 = require("../controllers/auditController");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.authMiddleware, auditController_1.listAudit);
exports.default = router;
//# sourceMappingURL=audit.js.map