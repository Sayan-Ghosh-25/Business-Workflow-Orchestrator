"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditLogs = listAuditLogs;
// src/services/auditService.ts
const dbService_1 = require("./dbService");
async function listAuditLogs(params = {}) {
    const { workflowId, userId, from, to } = params;
    const page = Number(params.page || 1);
    const pageSize = Number(params.pageSize || 50);
    const offset = (page - 1) * pageSize;
    const where = [];
    const values = [];
    if (workflowId) {
        values.push(workflowId);
        where.push(`a.workflow_id = $${values.length}`);
    }
    if (userId) {
        values.push(userId);
        where.push(`a.actor = $${values.length}`);
    }
    if (from) {
        values.push(from);
        where.push(`a.created_at >= $${values.length}`);
    }
    if (to) {
        values.push(to);
        where.push(`a.created_at <= $${values.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    // total count
    const totalRes = await (0, dbService_1.query)(`SELECT COUNT(*)::int AS total FROM public.audit_logs a ${whereSql}`, values);
    const total = Number(totalRes.rows[0]?.total || 0);
    // fetch items with actor name join (actor may be null for system events)
    const dataSql = `
    SELECT a.*, u.name AS actor_name
    FROM public.audit_logs a
    LEFT JOIN public.users u ON a.actor = u.id
    ${whereSql}
    ORDER BY a.created_at DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2};
  `;
    const dataRes = await (0, dbService_1.query)(dataSql, [...values, pageSize, offset]);
    // map rows to frontend-friendly shape
    const items = dataRes.rows.map((r) => {
        // details may be text or json -> normalize to string
        let detailsStr = "";
        try {
            if (r.details === null || r.details === undefined) {
                detailsStr = "";
            }
            else if (typeof r.details === "string") {
                detailsStr = r.details;
            }
            else {
                detailsStr = JSON.stringify(r.details);
            }
        }
        catch {
            detailsStr = String(r.details || "");
        }
        return {
            id: r.id,
            workflowId: r.workflow_id || "",
            action: r.action || "",
            actor: {
                id: r.actor || null,
                name: r.actor_name || (r.actor ? String(r.actor) : "system"),
            },
            details: detailsStr,
            timestamp: r.created_at ? (r.created_at.toISOString ? r.created_at.toISOString() : r.created_at) : null,
        };
    });
    return { items, total };
}
//# sourceMappingURL=auditService.js.map