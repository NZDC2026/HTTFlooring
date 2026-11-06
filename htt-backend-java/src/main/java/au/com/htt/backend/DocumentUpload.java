package au.com.htt.backend;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty("htt.staff.database.url")
class DocumentUpload {
    static final int UPLOAD_TIMEOUT_MS = 30_000;
    static final int MAX_BYTES = 10 * 1024 * 1024;
    private static final byte[] PNG = {(byte) 137, 80, 78, 71, 13, 10, 26, 10};
    private final JdbcClient jdbc;
    private final IdempotentWrite writes;

    DocumentUpload(JdbcClient jdbc, IdempotentWrite writes) {
        this.jdbc = jdbc;
        this.writes = writes;
    }

    Prepared prepare(StaffScope.CompanyAccess scope,UUID id,String fileName,HttpServletRequest request) {
        if (!jdbc.sql("SELECT platform.document_visible(:id)").param("id",id).query(Boolean.class).single()) {
            throw new StaffScope.Failure(404,"not_found","Document is unavailable in this scope.");
        }
        authorize(id);
        long version=version(request.getHeader("If-Match"));
        String filename=filename(fileName);
        String mediaType=request.getContentType();
        String type=mediaType==null?"":mediaType.split(";",2)[0].strip().toLowerCase(Locale.ROOT);
        return new Prepared(id,version,filename,type);
    }

    IdempotentWrite.StoredResponse finish(StaffScope.CompanyAccess scope,Prepared prepared,byte[] body,String key,String requestId) {
        UUID id=prepared.id();long version=prepared.version();String filename=prepared.filename();String type=prepared.type();
        if (body.length==0) throw new StaffScope.Failure(422,"invalid_file_size","File size must be 1 byte..10 MiB.");
        validate(body,type,filename);
        String sha=HexFormat.of().formatHex(IdempotentWrite.sha256(body));
        String canonical="{\"id\":\""+id+"\",\"version\":"+version+",\"filename\":"
                +CollaborationCreate.legacyString(filename)+",\"contentType\":\""+type+"\",\"sha\":\""+sha+"\",\"size\":"+body.length+"}";
        return writes.execute(scope,"POST /documents/"+id+"/attachments",key,canonical,
                ()->store(scope,id,version,filename,type,body,sha,requestId));
    }
    record Prepared(UUID id,long version,String filename,String type) {}

    private IdempotentWrite.StoredResponse store(StaffScope.CompanyAccess scope, UUID id, long version,
            String filename, String type, byte[] body, String sha, String requestId) {
        authorize(id);
        long actual = scoped("""
                SELECT version FROM platform.documents WHERE company_id=:company AND id=:id
                AND deleted_at IS NULL FOR SHARE
                """, scope).param("id", id).query(Long.class).optional()
                .orElseThrow(() -> new StaffScope.Failure(404, "not_found", "Resource was not found in the selected company."));
        authorize(id);
        if (actual != version) {
            throw new StaffScope.Failure(409, "version_conflict", "Document changed; refresh before requesting output.");
        }

        UUID file = UUID.randomUUID();
        UUID job = UUID.randomUUID();
        scoped("""
                INSERT INTO platform.files(id,company_id,object_key,content_type,size_bytes,sha256,created_by)
                VALUES (:file,:company,:object,:type,:size,:sha,:actor)
                """, scope).param("file", file).param("object", scope.companyId() + "/" + file)
                .param("type", type).param("size", body.length).param("sha", sha).param("actor", scope.actorId()).update();
        scoped("""
                INSERT INTO platform.file_contents(company_id,file_id,body) VALUES (:company,:file,:body)
                """, scope).param("file", file).param("body", body).update();
        scoped("""
                INSERT INTO platform.file_assets(company_id,file_id,document_id,source_version,filename,kind)
                VALUES (:company,:file,:id,:version,:filename,'ATTACHMENT')
                """, scope).param("file", file).param("id", id).param("version", version).param("filename", filename).update();
        scoped("""
                INSERT INTO platform.file_links(company_id,file_id,document_id,created_by)
                VALUES (:company,:file,:id,:actor)
                """, scope).param("file", file).param("id", id).param("actor", scope.actorId()).update();
        scoped("""
                INSERT INTO platform.document_jobs(id,company_id,document_id,source_version,kind,payload,created_by)
                VALUES (:job,:company,:id,:version,'SCAN',jsonb_build_object('fileId',CAST(:file AS text)),:actor)
                """, scope).param("job", job).param("id", id).param("version", version)
                .param("file", file).param("actor", scope.actorId()).update();
        scoped("""
                INSERT INTO platform.audit_events(company_id,actor_id,action,entity_type,entity_id,request_id,details)
                VALUES (:company,:actor,'documents.attachment_uploaded','file',:file,:request,
                    jsonb_build_object('documentId',CAST(:id AS text),'sourceVersion',CAST(:version AS bigint),
                                       'sha256',CAST(:sha AS text),'size',CAST(:size AS int)))
                """, scope).param("actor", scope.actorId()).param("file", file).param("request", requestId)
                .param("id", id).param("version", version).param("sha", sha).param("size", body.length).update();
        scoped("""
                INSERT INTO platform.outbox_events(company_id,event_type,payload,created_by)
                VALUES (:company,'documents.attachment_uploaded',
                    jsonb_build_object('entityId',CAST(:file AS text),'entityType','file'),:actor)
                """, scope).param("file", file).param("actor", scope.actorId()).update();
        return new IdempotentWrite.StoredResponse(202, "{\"id\":\"" + file + "\",\"jobId\":\"" + job
                + "\",\"state\":\"PENDING\",\"version\":1,\"sha256\":\"" + sha + "\"}");
    }

    private JdbcClient.StatementSpec scoped(String sql, StaffScope.CompanyAccess scope) {
        return jdbc.sql(sql).param("company", scope.companyId());
    }

    private void authorize(UUID id) {
        jdbc.sql("SELECT platform.require_document_access(:id,'UPLOAD')")
                .param("id", id).query((row, index) -> true).single();
    }

    private static long version(String header) {
        String value = header == null ? "" : header.replaceAll("^\"+|\"+$", "");
        try {
            if (!value.matches("[0-9]+")) {
                throw new NumberFormatException();
            }
            long version = Long.parseLong(value);
            if (version > 0) {
                return version;
            }
        } catch (NumberFormatException invalid) {
            // Missing, malformed and overflowing versions use the same response.
        }
        throw new StaffScope.Failure(428, "version_required", "Supply If-Match with the current document version.");
    }

    private static String filename(String value) {
        String name = value.strip();
        if (name.isEmpty() || name.length() > 180 || name.startsWith(".")
                || name.chars().anyMatch(c -> Character.isISOControl(c) || "/\\:\"".indexOf(c) >= 0)) {
            throw new StaffScope.Failure(422, "invalid_filename",
                    "Use a filename without paths or control characters (max 180).");
        }
        return name;
    }

    private static void validate(byte[] body, String type, String filename) {
        String name = filename.toLowerCase(Locale.ROOT);
        boolean valid = switch (type) {
            case "image/png" -> name.endsWith(".png") && body.length >= PNG.length
                    && Arrays.equals(body, 0, PNG.length, PNG, 0, PNG.length);
            case "image/jpeg" -> (name.endsWith(".jpg") || name.endsWith(".jpeg")) && body.length >= 4
                    && (body[0] & 255) == 255 && (body[1] & 255) == 216
                    && (body[body.length - 2] & 255) == 255 && (body[body.length - 1] & 255) == 217;
            case "application/pdf" -> name.endsWith(".pdf") && body.length >= 5
                    && new String(body, 0, 5, StandardCharsets.US_ASCII).equals("%PDF-")
                    && new String(body, Math.max(0, body.length - 1024), Math.min(1024, body.length),
                            StandardCharsets.US_ASCII).contains("%%EOF");
            default -> false;
        };
        if (!valid) {
            throw new StaffScope.Failure(422, "unsupported_file",
                    "Upload a PDF, PNG or JPEG with matching filename, MIME and file signature.");
        }
    }
}
