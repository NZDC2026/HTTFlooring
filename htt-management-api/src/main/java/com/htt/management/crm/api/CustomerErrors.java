package com.htt.management.crm.api;

import com.htt.management.crm.domain.CustomerRules.InvalidCustomer;
import com.htt.management.platform.web.ApiError;
import com.htt.management.platform.web.RequestIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes=CustomerController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CustomerErrors {
    @ExceptionHandler({InvalidCustomer.class,IllegalArgumentException.class,tools.jackson.core.JacksonException.class})
    ResponseEntity<ApiError> invalid(RuntimeException failure,HttpServletRequest request) {
        Throwable cause=failure;
        while(cause.getCause()!=null && cause.getCause()!=cause) cause=cause.getCause();
        String field=cause instanceof InvalidCustomer invalid?invalid.field():"body";
        return ResponseEntity.badRequest().body(new ApiError("INVALID_REQUEST","Invalid customer input.",RequestIdFilter.requestId(request),false,
                List.of(new ApiError.FieldError(field,"Invalid value."))));
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> conflict(DataIntegrityViolationException failure,HttpServletRequest request) {
        return ResponseEntity.status(409).body(ApiError.of("CONFLICT","A customer constraint prevented the change.",request));
    }
}
