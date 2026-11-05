package au.com.htt.backend;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

@Component
class LegacyRows {
    private final JsonMapper json;

    LegacyRows(JsonMapper json) {
        this.json = json;
    }

    Map<String, Object> row(ResultSet row, int index) throws SQLException {
        var result = new LinkedHashMap<String, Object>();
        var columns = row.getMetaData();
        for (int column = 1; column <= columns.getColumnCount(); column++) {
            Object value = row.getObject(column);
            if (value instanceof BigDecimal decimal) {
                value = decimal.toPlainString();
            } else if (value instanceof java.sql.Timestamp timestamp) {
                value = new java.time.format.DateTimeFormatterBuilder().appendInstant(-1).toFormatter()
                        .format(timestamp.toInstant());
            } else if (value instanceof java.sql.Date date) {
                value = date.toLocalDate().toString();
            } else if (value != null && !(value instanceof UUID) && columns.getColumnType(column) == Types.OTHER
                    && (columns.getColumnTypeName(column).equals("jsonb") || columns.getColumnTypeName(column).equals("json"))) {
                value = json.readTree(value.toString());
            }
            result.put(camel(columns.getColumnLabel(column)), value);
        }
        return result;
    }

    private static String camel(String name) {
        var parts = name.split("_");
        var result = new StringBuilder(parts[0]);
        for (int i = 1; i < parts.length; i++) {
            result.append(Character.toUpperCase(parts[i].charAt(0))).append(parts[i].substring(1));
        }
        return result.toString();
    }
}
