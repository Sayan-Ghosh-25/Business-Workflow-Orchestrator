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
exports.listApprovalsController = listApprovalsController;
exports.performApproval = performApproval;
const workflowService = __importStar(require("../services/workflowService"));
/* GET /approvals
 * Returns an array of workflows assigned to the current approver */
async function listApprovalsController(req, res, next) {
    try {
        const approverId = req.user?.userId;
        if (!approverId)
            return res.status(401).json({ error: "unauthorized" });
        const workflows = await workflowService.getApprovalsForUser(approverId);
        res.json(workflows);
    }
    catch (err) {
        next(err);
    }
}
/* POST /approvals/:id/action
 * Performs approve/reject/request_changes for the given workflow as current approver.
 * Returns the updated mapped workflow object */
async function performApproval(req, res, next) {
    try {
        const { id } = req.params;
        const { action, comment } = req.body;
        const approverId = req.user?.userId;
        if (!approverId)
            return res.status(401).json({ error: "unauthorized" });
        // call the shared workflow approval service (returns mapped workflow)
        const wf = await workflowService.approveWorkflowRecord(id, approverId, action, comment || "");
        res.json(wf);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=approvalsController.js.map