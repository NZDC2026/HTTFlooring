package com.htt.management.platform.web;

import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

public record ApiError(String code, String message, String requestId,
        boolean retryable, List<FieldError> fieldErrors) {

    public ApiError {
        fieldErrors = List.copyOf(fieldErrors);
    }

    public static ApiError of(String code, String message, HttpServletRequest request) {
        return new ApiError(code, message, RequestIdFilter.requestId(request), false, List.of());
    }

    public record FieldError(String field, String message) { }
}
