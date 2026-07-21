"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkflow = createWorkflow;
exports.listWorkflows = listWorkflows;
exports.getWorkflow = getWorkflow;
exports.submitWorkflow = submitWorkflow;
exports.approveWorkflowController = approveWorkflowController;
exports.withdrawWorkflowController = withdrawWorkflowController;
const workflowService = __importStar(require("../services/workflowService"));
const dbService_1 = require("../services/dbService");
// Create/upload workflow
async function createWorkflow(req, res, next) {
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ error: "file required" });
        const type = req.body.type || "doc";
        const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
        const submitterId = req.user?.userId;
        const wf = await workflowService.createWorkflowRecord({
            type,
            submitterId,
            attachmentBuffer: file.buffer,
            attachmentName: file.originalname,
            metadata
        });
        // wf is mapped full workflow
        res.status(201).json(wf);
    }
    catch (err) {
        next(err);
    }
}
// List with pagination & filters — returns { data, total }
async function listWorkflows(req, res, next) {
    try {
        const { status, type, q, page = 1, pageSize = 20 } = req.query;
        const result = await workflowService.listWorkflows({ status, type, q, page: Number(page), pageSize: Number(pageSize) });
        // result already shaped as { data, total }
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
// Get detail — returns full mapped workflow
async function getWorkflow(req, res, next) {
    try {
        const { id } = req.params;
        const wf = await workflowService.getWorkflowById(Array.isArray(id) ? id[0] : id);
        if (!wf)
            return res.status(404).json({ error: "not found" });
        res.json(wf);
    }
    catch (err) {
        next(err);
    }
}
// Submit edits
async function submitWorkflow(req, res, next) {
    try {
        const { id } = req.params;
        const payload = req.body;
        // save edits into ai_result or metadata per contract
        await (0, dbService_1.query)(`UPDATE public.workflows SET ai_result = $1, metadata = $2, updated_at = now() WHERE id = $3`, [payload.aiResult || null, payload.metadata || {}, id]);
        await (0, dbService_1.query)(`INSERT INTO public.workflow_history (workflow_id, from_status, to_status, actor, comment, created_at) VALUES ($1,$2,$3,$4,$5,now())`, [id, null, "UNDER_REVIEW", req.user?.userId, "Submitted edits"]);
        // return updated mapped workflow
        const wf = await workflowService.getWorkflowById(id);
        res.json(wf);
    }
    catch (err) {
        next(err);
    }
}
// Approve/reject/request_changes endpoint (called from UI)
async function approveWorkflowController(req, res, next) {
    try {
        const { id } = req.params;
        const { action, comment } = req.body;
        const approverId = req.user?.userId;
        const wf = await workflowService.approveWorkflowRecord(id, approverId, action, comment || "");
        res.json(wf);
    }
    catch (err) {
        next(err);
    }
}
// Withdraw workflow (submitter)
async function withdrawWorkflowController(req, res, next) {
    try {
        const { id } = req.params;
        const actorId = req.user?.userId;
        const wf = await workflowService.withdrawWorkflowRecord(id, actorId);
        res.json(wf);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=workflowsController.js.map