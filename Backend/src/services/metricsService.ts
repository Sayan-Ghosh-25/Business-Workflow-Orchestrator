// src/services/metricsService.ts
import { query } from "./dbService";

    export async function buildMetrics() {
    // --- Summary values
    const totalRes = await query(`SELECT count(*) FROM public.workflows`);
    const totalDocuments = Number(totalRes.rows[0]?.count || 0);

    const autoRes = await query(`SELECT count(*) FROM public.workflows WHERE status = 'AI_AUTO_APPROVED'`);
    const autoApproved = Number(autoRes.rows[0]?.count || 0);

    const rejectedRes = await query(`SELECT count(*) FROM public.workflows WHERE status = 'REJECTED'`);
    const rejectedCount = Number(rejectedRes.rows[0]?.count || 0);

    // pending review = in AI_PROCESSED or UNDER_REVIEW
    const pendingRes = await query(`SELECT count(*) FROM public.workflows WHERE status IN ('AI_PROCESSED','UNDER_REVIEW')`);
    const pendingReview = Number(pendingRes.rows[0]?.count || 0);

    // average turnaround hours (from submitted_at -> first APPROVED history.created_at)
    const avgRes = await query(`
      SELECT AVG(EXTRACT(EPOCH FROM (approved_at - submitted_at))/3600)::numeric as avg_hours
      FROM (
        SELECT w.id, w.submitted_at,
          (SELECT created_at FROM public.workflow_history h WHERE h.workflow_id = w.id AND h.to_status = 'APPROVED' ORDER BY created_at ASC LIMIT 1) as approved_at
        FROM public.workflows w
      ) t
      WHERE approved_at IS NOT NULL
    `);
    const avgApprovalHours = Number(avgRes.rows[0]?.avg_hours || 0);

    // timeSavedHours — heuristic: each autoApproved is estimated to save 0.75 hours (45min)
    const timeSavedHours = Number((autoApproved * 0.75).toFixed(2));

    // autoApprovalRate in percent
    const autoApprovalRate = totalDocuments === 0 ? 0 : Number(((autoApproved / totalDocuments) * 100).toFixed(2));

    // --- Monthly trend (last 12 months)
    const monthlyTrendRes = await query(
      `
      SELECT to_char(date_trunc('month', submitted_at),'Mon YYYY') as month,
             count(*) as submitted,
             SUM(CASE WHEN status = 'AI_AUTO_APPROVED' THEN 1 ELSE 0 END) as auto_approved
      FROM public.workflows
      WHERE submitted_at >= (date_trunc('month', now()) - interval '11 months')
      GROUP BY 1
      ORDER BY min(date_trunc('month', submitted_at)) ASC
      `
    );
    const monthlyTrend = monthlyTrendRes.rows.map((r: any) => {
      const submitted = Number(r.submitted || 0);
      const autoApprovedMonth = Number(r.auto_approved || 0);
      return {
        month: r.month,
        year: parseInt(r.month.split(' ')[1]),
        submitted,
        autoApproved: autoApprovedMonth,
        manual: Math.max(0, submitted - autoApprovedMonth)
      };
    });

    // --- By Type
    const byTypeRes = await query(`
      SELECT COALESCE(type,'unknown') as type, count(*) as count
      FROM public.workflows
      GROUP BY 1
      ORDER BY count DESC
    `);
    const byType = byTypeRes.rows.map((r: any) => ({ type: r.type, count: Number(r.count || 0) }));

    // --- Turnaround distribution buckets (hours between submitted -> first approved)
    const turnaroundRes = await query(`
      SELECT bucket, count FROM (
        SELECT
          CASE
            WHEN diff_hours < 1 THEN '<1h'
            WHEN diff_hours < 4 THEN '1-4h'
            WHEN diff_hours < 12 THEN '4-12h'
            WHEN diff_hours < 24 THEN '12-24h'
            ELSE '24h+'
          END as bucket,
          count(*) as count
        FROM (
          SELECT w.id,
            EXTRACT(EPOCH FROM (
              (SELECT h.created_at FROM public.workflow_history h WHERE h.workflow_id = w.id AND h.to_status = 'APPROVED' ORDER BY h.created_at ASC LIMIT 1)
              - w.submitted_at
            ))/3600 as diff_hours
          FROM public.workflows w
        ) t
        WHERE diff_hours IS NOT NULL
        GROUP BY 1
      ) s
      ORDER BY
        CASE WHEN bucket = '<1h' THEN 1
             WHEN bucket = '1-4h' THEN 2
             WHEN bucket = '4-12h' THEN 3
             WHEN bucket = '12-24h' THEN 4
             WHEN bucket = '24h+' THEN 5
             ELSE 99 END
    `);
    const turnaroundDistribution = turnaroundRes.rows.map((r: any) => ({ range: r.bucket, count: Number(r.count || 0) }));

    // --- Confidence distribution buckets (ai_result->>'confidence')
    const confidenceRes = await query(`
      SELECT bucket, count FROM (
        SELECT
          CASE
            WHEN conf < 0.6 THEN '0-59%'
            WHEN conf < 0.7 THEN '60-69%'
            WHEN conf < 0.8 THEN '70-79%'
            WHEN conf < 0.9 THEN '80-89%'
            ELSE '90-100%'
          END as bucket,
          count(*) as count
        FROM (
          SELECT (ai_result->>'confidence')::numeric as conf
          FROM public.workflows
          AND ai_result->>'confidence' IS NOT NULL
        ) t
        GROUP BY 1
      ) s
      ORDER BY
        CASE WHEN bucket = '0-59%' THEN 1
             WHEN bucket = '60-69%' THEN 2
             WHEN bucket = '70-79%' THEN 3
             WHEN bucket = '80-89%' THEN 4
             WHEN bucket = '90-100%' THEN 5 ELSE 99 END
    `);

    const confidenceDistribution = confidenceRes.rows.map(
        (r: any) => (
            { range: r.bucket, count: Number(r.count || 0) }
        ));

    return {
      summary: {
        totalDocuments,
        autoApprovalRate,
        autoApproved,
        avgTurnaroundHours: Number(avgApprovalHours.toFixed(2)),
        timeSavedHours,
        pendingReview,
        rejectedCount,
      },
      monthlyTrend,
      byType,
      turnaroundDistribution,
      confidenceDistribution,
    };
  }
