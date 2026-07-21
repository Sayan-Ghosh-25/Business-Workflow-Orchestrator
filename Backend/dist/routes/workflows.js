"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/workflows.ts
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const workflowsController_1 = require("../controllers/workflowsController");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024) } });
// create/upload workflow
router.post("/", authMiddleware_1.authMiddleware, upload.single("file"), workflowsController_1.createWorkflow);
// list
router.get("/", authMiddleware_1.authMiddleware, workflowsController_1.listWorkflows);
// get detail
router.get("/:id", authMiddleware_1.authMiddleware, workflowsController_1.getWorkflow);
// submit edited
router.post("/:id/submit", authMiddleware_1.authMiddleware, workflowsController_1.submitWorkflow);
// approve/reject/request_changes
router.post("/:id/approve", authMiddleware_1.authMiddleware, workflowsController_1.approveWorkflowController);
// withdraw
router.post("/:id/withdraw", authMiddleware_1.authMiddleware, workflowsController_1.withdrawWorkflowController);
exports.default = router;
//# sourceMappingURL=workflows.js.map