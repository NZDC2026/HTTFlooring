using Htt.Infrastructure;
using Npgsql;

namespace Htt.Host.Api;

internal static class ReconciliationEndpoints
{
    public static void MapReconciliation(this WebApplication app)
    {
        app.MapGet("/api/v1/accounting/reconciliation", async (CompanySession session, CancellationToken ct) =>
        {
            // Aggregates and bounded diagnostics are derived together, in a single MVCC snapshot.
            // Compare each entity before aggregation: opposite discrepancies must never cancel out.
            await using var command = new NpgsqlCommand("""
                WITH checks AS MATERIALIZED (SELECT * FROM accounting.reconciliation_checks()),
                summaries AS (
                  SELECT check_code,unit,count(*) AS checked_count,count(*) FILTER(WHERE expected<>actual) AS mismatch_count,
                    sum(expected) AS expected,sum(actual) AS actual
                  FROM checks GROUP BY check_code,unit
                )
                SELECT jsonb_build_object('companyId',core.current_company(),'currency','AUD',
                  'snapshotAt',statement_timestamp(),'status',CASE WHEN EXISTS(SELECT 1 FROM checks WHERE expected<>actual) THEN 'MISMATCH' ELSE 'CONSISTENT' END,
                  'checks',coalesce((SELECT jsonb_agg(jsonb_build_object(
                    'code',s.check_code,'unit',s.unit,'checkedCount',s.checked_count,'mismatchCount',s.mismatch_count,
                    'expected',s.expected::text,'actual',s.actual::text,'difference',(s.actual-s.expected)::text,
                    'issues',coalesce((SELECT jsonb_agg(jsonb_build_object('entityId',d.entity_id,
                      'expected',d.expected::text,'actual',d.actual::text,'difference',(d.actual-d.expected)::text) ORDER BY d.entity_id)
                      FROM (SELECT * FROM checks c WHERE c.check_code=s.check_code AND c.expected<>c.actual ORDER BY c.entity_id LIMIT 20)d),'[]'::jsonb),
                    'issuesTruncated',s.mismatch_count>20) ORDER BY s.check_code) FROM summaries s),'[]'::jsonb))::text
                """, session.Connection, session.Transaction);
            var json = (string)(await command.ExecuteScalarAsync(ct))!;
            return Results.Content(json, "application/json");
        }).RequireAuthorization().RequireRateLimiting("api").AddEndpointFilter<CompanyFilter>()
          .WithMetadata(new Permission("accounting.reconciliation.read"));
    }
}
