package com.htt.management.identity;

import com.htt.management.platform.web.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.CannotSerializeTransactionException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes=CustomerAccountController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CustomerAccountErrors {
    @ExceptionHandler({DataIntegrityViolationException.class,CannotSerializeTransactionException.class})
    ResponseEntity<ApiError> conflict(RuntimeException failure,HttpServletRequest request) {
        return ResponseEntity.status(409).body(ApiError.of("CONFLICT","Account identity, ownership or version conflict.",request));
    }
    @ExceptionHandler({IllegalArgumentException.class,tools.jackson.core.JacksonException.class})
    ResponseEntity<ApiError> invalid(RuntimeException failure,HttpServletRequest request) {
        return ResponseEntity.badRequest().body(ApiError.of("INVALID_REQUEST","Invalid account input.",request));
    }
}
