"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/approvals.ts
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const approvalsController_1 = require("../controllers/approvalsController");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)(["approver", "admin"]), approvalsController_1.listApprovalsController);
router.post("/:id/action", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)(["approver", "admin"]), approvalsController_1.performApproval);
exports.default = router;
//# sourceMappingURL=approvals.js.map