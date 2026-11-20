package com.htt.management.hr;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateEmployeeRequest(
        @NotBlank @Size(max = 200) String fullName,
        @Size(max = 200) String position,
        @Size(max = 40) String mobile,
        @Size(max = 400) String address,
        @Size(max = 254) @Email String email,
        @NotNull @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "uuuu-MM-dd",
                lenient = com.fasterxml.jackson.annotation.OptBoolean.FALSE) LocalDate startDate,
        EmploymentType employmentType,
        EmploymentCategory employmentCategory,
        PayBasis payBasis,
        @DecimalMin("0") @Digits(integer = 12, fraction = 2) BigDecimal payRate,
        @DecimalMin("0") @DecimalMax("100") @Digits(integer = 3, fraction = 2) BigDecimal commissionPercent,
        @Size(max = 300) String emergencyContact) {

    public enum EmploymentType { FULL_TIME, PART_TIME, CASUAL }
    public enum EmploymentCategory { PERMANENT, TEMPORARY, CASUAL }
    public enum PayBasis { HOURLY, ANNUAL_SALARY }

    public CreateEmployeeRequest {
        fullName = trimmed(fullName);
        position = trimmed(position);
        mobile = trimmed(mobile);
        address = trimmed(address);
        email = trimmed(email);
        emergencyContact = trimmed(emergencyContact);
        if (employmentType == null) employmentType = EmploymentType.FULL_TIME;
        if (employmentCategory == null) employmentCategory = EmploymentCategory.PERMANENT;
    }

    @JsonAnySetter
    public void rejectUnexpectedField(String name, Object value) {
        throw new IllegalArgumentException("Unexpected employee field");
    }

    private static String trimmed(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }

    @Override public String toString() { return "CreateEmployeeRequest[redacted]"; }
}
