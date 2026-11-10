package au.com.htt.backend;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
@RestController
@ConditionalOnProperty("htt.staff.database.url")
class ReconciliationRead {
 private final StaffScope staff;private final JdbcClient jdbc;
 ReconciliationRead(StaffScope staff,JdbcClient jdbc){this.staff=staff;this.jdbc=jdbc;}
 @GetMapping("/api/v1/accounting/reconciliation")
 ResponseEntity<String> read(@AuthenticationPrincipal Jwt token,HttpServletRequest request){
  var scope=staff.require(token,request.getHeader("X-Company-Id"),"accounting.reconciliation.read");
  return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(staff.inCompany(scope,(String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),()->jdbc.sql(SQL).query(String.class).single()));
 }
 private static final String SQL="""

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
                
""";
}
