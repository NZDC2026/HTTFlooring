package com.htt.management.crm.api;

import com.htt.management.platform.web.RequestIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.TransactionException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Compatibility with htt-backend/Program.cs, scoped to CTX-002 only. Authentication keeps ADR-0005 behavior. */
@RestControllerAdvice(assignableTypes = PortalBranchController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PortalBranchErrors {
    private static final Logger LOG = LoggerFactory.getLogger(PortalBranchErrors.class);
    public record LegacyError(String code, String message, String requestId, boolean retryable, Object fieldErrors) { }

    @ExceptionHandler(PortalBranchContext.Required.class)
    ResponseEntity<LegacyError> contextRequired(HttpServletRequest request) {
        return error(request,400,"portal_context_required",
                "Select a company and portal grant using X-Company-Id and X-Portal-Grant-Id.",false);
    }
    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<LegacyError> denied(HttpServletRequest request) {
        return error(request,403,"scope_denied","The database rejected this data scope.",false);
    }
    @ExceptionHandler({DataAccessException.class, TransactionException.class})
    ResponseEntity<LegacyError> unavailable(RuntimeException failure,HttpServletRequest request) {
        LOG.error("Portal branches unavailable; requestId={}, failure={}",RequestIdFilter.requestId(request),failure.getClass().getSimpleName());
        return error(request,503,"database_unavailable",
                "The service is temporarily unavailable; check the operation result before retrying.",true);
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<LegacyError> unexpected(Exception failure,HttpServletRequest request) {
        LOG.error("Portal branches failed; requestId={}, failure={}",RequestIdFilter.requestId(request),failure.getClass().getSimpleName());
        return error(request,500,"internal_error","The operation could not be completed.",false);
    }
    private static ResponseEntity<LegacyError> error(HttpServletRequest request,int status,String code,String message,boolean retryable) {
        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_JSON).header("Cache-Control","no-store")
                .body(new LegacyError(code,message,RequestIdFilter.requestId(request),retryable,null));
    }
}
