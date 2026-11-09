package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = {TaskReads.class, BranchMaps.class, CollaborationTransitions.class, CollaborationReads.class, CrmDraftWrites.class, CrmDraftReads.class, DiscoverySearch.class, UnitBarcodes.class, BusinessSettings.class, StaffIdentityController.class, CustomerCorrections.class, CustomerRefunds.class, SalesCredits.class, SalesReturns.class, CustomerGst.class, CustomerCreditApplications.class, SupplierCreditApplications.class, PurchaseReturns.class, SupplierRefunds.class, SupplierRefundCorrections.class, SupplierExpenses.class, WarehouseOrders.class, ReportDesignerWrites.class, ReportDesignerReads.class, SalesAnalytics.class, OperatingReports.class, PeriodCloseWrites.class, PeriodCloseReads.class, BasWrites.class, BasReads.class, CashFlow.class, FinancialReports.class, BankFeeds.class, BankRuleWrites.class, BankRuleReads.class, BankStatementImport.class, BankClearing.class, BankStatementReads.class, GeneralBanking.class, LedgerReads.class, BankAccounts.class, TransitTransfers.class, WarehouseDetails.class, BinCounts.class, InventoryCounts.class, InventoryOperations.class, CrmContacts.class, CrmBranches.class, CrmParties.class, CatalogMaintenance.class, CatalogLookups.class, PromotionPricing.class, CustomerPricing.class, PricingRules.class, QuoteConversion.class, DirectOrders.class, QuoteDrafts.class, QuoteTransitions.class, PurchaseGst.class, PurchaseOrders.class, SupplierBills.class, SupplierPayments.class})
class StaffApiErrors {
    @ExceptionHandler({org.springframework.http.converter.HttpMessageNotReadableException.class,
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
            org.springframework.web.bind.MissingServletRequestParameterException.class})
    ResponseEntity<ApiError> invalidRequest(HttpServletRequest request) {
        return sqlError(400,"invalid_request","Invalid request body or parameters.",
                (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),false);
    }

    @ExceptionHandler(AsyncAttachmentBody.ReadFailure.class)
    ResponseEntity<ApiError> uploadReadFailure(AsyncAttachmentBody.ReadFailure failure,HttpServletRequest request) {
        return sqlError(failure.status,failure.code,failure.getMessage(),
                (String)request.getAttribute(ApiResponseHeaders.REQUEST_ID),false);
    }

    @ExceptionHandler(StaffScope.Failure.class)
    ResponseEntity<ApiError> accessDenied(StaffScope.Failure failure, HttpServletRequest request) {
        return error(failure.status, failure.code, failure.getMessage(),
                (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID), false);
    }

    @ExceptionHandler(BranchQuery.InvalidFilter.class)
    ResponseEntity<ApiError> invalidFilter(BranchQuery.InvalidFilter invalid, HttpServletRequest request) {
        String message = invalid.getMessage();
        return ResponseEntity.unprocessableContent().body(new ApiError("invalid_master_data", message,
                (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID), false,
                Map.of(invalid.field, List.of(message))));
    }

    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<ApiError> databaseUnavailable(DataAccessException exception, HttpServletRequest request) {
        String requestId = (String) request.getAttribute(ApiResponseHeaders.REQUEST_ID);
        if (exception.getMostSpecificCause() instanceof SQLException sql && sql.getSQLState() != null) {
            return switch (sql.getSQLState()) {
                case "23505" -> sqlError(409, "duplicate", "The resource or operation already exists.", requestId, false);
                case "23503", "23514", "23P01", "22003" -> sqlError(422, "constraint_violation",
                        "A reference, effective interval, or business constraint is invalid.", requestId, false);
                case "42501" -> sqlError(403, "scope_denied", "The database rejected this data scope.", requestId, false);
                case "HT409" -> sqlError(409, "invoice_conflict",
                        "Order changed, is not confirmed, or quantity exceeds the delivered uninvoiced remainder.", requestId, false);
                case "HT422" -> sqlError(422, "invoice_validation", sqlMessage(sql), requestId, false);
                case "HT404" -> sqlError(404, "not_found", "Resource is unavailable in this scope.", requestId, false);
                case "HP409" -> sqlError(409, "purchase_conflict", sqlMessage(sql), requestId, false);
                case "HP422" -> sqlError(422, "purchase_validation", sqlMessage(sql), requestId, false);
                case "HI409" -> sqlError(409, "inventory_control_conflict", sqlMessage(sql), requestId, false);
                case "HI422" -> sqlError(422, "inventory_control_validation", sqlMessage(sql), requestId, false);
                case "HD409" -> sqlError(409, "document_conflict", sqlMessage(sql), requestId, false);
                case "HD422" -> sqlError(422, "document_validation", sqlMessage(sql), requestId, false);
                case "HR409" -> sqlError(409, "settlement_conflict", sqlMessage(sql), requestId, false);
                case "HR422" -> sqlError(422, "settlement_validation", sqlMessage(sql), requestId, false);
                case "55P03", "40001", "40P01" -> sqlError(409, "concurrent_operation",
                        "Another operation is in progress; retry with the same idempotency key.", requestId, true);
                default -> databaseUnavailable(requestId);
            };
        }
        return databaseUnavailable(requestId);
    }

    private static String sqlMessage(SQLException sql) {
        return sql.getMessage().lines().findFirst().orElse("").replaceFirst("^ERROR: ", "");
    }

    private static ResponseEntity<ApiError> sqlError(
            int status, String code, String message, String requestId, boolean retryable) {
        return ResponseEntity.status(status).body(new ApiError(code, message, requestId, retryable, null));
    }

    private static ResponseEntity<ApiError> databaseUnavailable(String requestId) {
        return error(503, "database_unavailable",
                "The service is temporarily unavailable; check the operation result before retrying.",
                requestId, true);
    }

    private static ResponseEntity<ApiError> error(
            int status, String code, String message, String requestId, boolean retryable) {
        return ResponseEntity.status(status).body(new ApiError(code, message, requestId, retryable, status == 503 ? null : Map.of()));
    }

    record ApiError(String code, String message, String requestId, boolean retryable, Object fieldErrors) {}

}
