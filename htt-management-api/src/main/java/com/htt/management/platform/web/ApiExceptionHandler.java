package com.htt.management.platform.web;

import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataAccessException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger LOG = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException exception,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<ApiError.FieldError> fields = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> new ApiError.FieldError(error.getField(), "Invalid value."))
                .distinct().toList();
        ApiError body = new ApiError("VALIDATION_FAILED", "Request validation failed.",
                RequestIdFilter.requestId(servletRequest(request)), false, fields);
        return new ResponseEntity<>(body, headers, HttpStatus.UNPROCESSABLE_CONTENT);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception exception, Object body,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String code = switch (status.value()) {
            case 400 -> "INVALID_REQUEST";
            case 404 -> "NOT_FOUND";
            case 405 -> "METHOD_NOT_ALLOWED";
            case 406 -> "NOT_ACCEPTABLE";
            case 415 -> "UNSUPPORTED_MEDIA_TYPE";
            case 422 -> "VALIDATION_FAILED";
            case 503 -> "SERVICE_UNAVAILABLE";
            default -> status.is5xxServerError() ? "INTERNAL_ERROR" : "REQUEST_REJECTED";
        };
        if (status.is5xxServerError()) {
            logFailure(exception, servletRequest(request));
        }
        return new ResponseEntity<>(ApiError.of(code, "The request could not be processed.",
                servletRequest(request)), headers, status);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiError> accessDenied(AccessDeniedException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiError.of("ACCESS_DENIED", "Access is denied.", request));
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiError> authenticationRequired(AuthenticationException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiError.of("AUTHENTICATION_REQUIRED", "Authentication is required.", request));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> unexpectedFailure(Exception exception, HttpServletRequest request) {
        logFailure(exception, request);
        return ResponseEntity.internalServerError()
                .body(ApiError.of("INTERNAL_ERROR", "An unexpected error occurred.", request));
    }

    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<ApiError> storageUnavailable(DataAccessException exception, HttpServletRequest request) {
        LOG.error("Storage unavailable; requestId={}, failure={}", RequestIdFilter.requestId(request),
                exception.getClass().getSimpleName());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiError.of("SERVICE_UNAVAILABLE", "The service is temporarily unavailable.", request));
    }

    private static HttpServletRequest servletRequest(WebRequest request) {
        return ((ServletWebRequest) request).getRequest();
    }

    private static void logFailure(Exception exception, HttpServletRequest request) {
        LOG.error("Request failed; requestId={}", RequestIdFilter.requestId(request), exception);
    }
}
