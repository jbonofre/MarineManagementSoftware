package net.nanthrax.moussaillon.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

import jakarta.json.bind.adapter.JsonbAdapter;

/**
 * Accept both date-only (yyyy-MM-dd) and date-time payloads for Timestamp fields.
 */
public class TimestampJsonbAdapter implements JsonbAdapter<Timestamp, String> {

    @Override
    public String adaptToJson(Timestamp value) {
        if (value == null) {
            return null;
        }
        return value.toLocalDateTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    @Override
    public Timestamp adaptFromJson(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        String normalized = value.trim().replace(' ', 'T');

        // Date only -> midnight
        if (normalized.length() == 10) {
            LocalDate date = LocalDate.parse(normalized, DateTimeFormatter.ISO_LOCAL_DATE);
            return Timestamp.valueOf(date.atStartOfDay());
        }

        // ISO local datetime (no zone)
        try {
            LocalDateTime localDateTime = LocalDateTime.parse(normalized, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            return Timestamp.valueOf(localDateTime);
        } catch (Exception ignored) {
            // Try offset/instant formats below.
        }

        // ISO with offset/timezone
        try {
            OffsetDateTime offsetDateTime = OffsetDateTime.parse(normalized, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            return Timestamp.from(offsetDateTime.toInstant());
        } catch (Exception ignored) {
            // Try instant below.
        }

        // ISO instant (e.g. 2026-03-01T09:00:00Z)
        Instant instant = Instant.parse(normalized);
        return Timestamp.from(instant.atOffset(ZoneOffset.UTC).toInstant());
    }
}
