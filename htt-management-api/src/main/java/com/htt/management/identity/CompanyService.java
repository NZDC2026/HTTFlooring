package com.htt.management.identity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

@Service
@ConditionalOnProperty(name={"htt.auth.enabled","htt.companies.enabled"},havingValue="true")
public class CompanyService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;
    private final AccessAudit audit;
    public CompanyService(JdbcTemplate jdbc,ObjectMapper json,AccessAudit audit) {this.jdbc=jdbc;this.json=json;this.audit=audit;}
    @io.swagger.v3.oas.annotations.media.Schema(name="CreateCompanyRequest")
    public record Create(@NotBlank @Pattern(regexp="[A-Z0-9][A-Z0-9_-]{0,63}") String code,
            @NotBlank @Size(max=200) String name,@NotBlank @Size(max=100) String city) { }
    @io.swagger.v3.oas.annotations.media.Schema(name="OperatingCompany")
    public record Company(UUID id,String code,String name,String city,String status,long version,Instant createdAt,Instant updatedAt) { }

    @Transactional(timeout=10)
    public Company create(UUID operation,Create input) {
        var user=ResourceAccess.currentUser();
        var request=((ServletRequestAttributes)RequestContextHolder.currentRequestAttributes()).getRequest();
        boolean allowed=user!=null&&user.realm()==AccessSnapshot.Realm.STAFF&&user.access().globalPermissions().contains("company:create");
        audit.record(request,"company:create",null,null,allowed?"ALLOW":"DENY");
        if(!allowed)throw new AccessDeniedException("Access is denied.");
        var normalized=new Create(input.code(),input.name().strip(),input.city().strip());
        try {
            String data=jdbc.queryForObject("select identity.create_company(?,?,?,?,?,?)::text",String.class,
                    user.access().actorId(),operation,hash(normalized),normalized.code(),normalized.name(),normalized.city());
            return json.readValue(data,Company.class);
        } catch(DataAccessException failure) {
            Throwable root=failure;while(root.getCause()!=null&&root.getCause()!=root)root=root.getCause();
            if(root instanceof java.sql.SQLException sql) {
                switch(sql.getSQLState()) {
                    case "42501" -> {
                        audit.record(request,"company:create",null,null,"DENY");
                        throw new AccessDeniedException("Access is denied.");
                    }
                    case "23505" -> throw new ResponseStatusException(HttpStatus.CONFLICT,"Company code or idempotency conflict");
                    case "23514","22001" -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid company input");
                }
            }
            throw failure;
        }
    }
    static String hash(Create input) {
        String value=input.code().length()+":"+input.code()+input.name().length()+":"+input.name()+input.city().length()+":"+input.city();
        try {return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}
        catch(java.security.NoSuchAlgorithmException failure){throw new IllegalStateException(failure);}
    }
}
