package net.nanthrax.moussaillon.cli;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;
import jakarta.json.JsonValue;
import jakarta.json.JsonWriter;
import jakarta.json.JsonWriterFactory;
import jakarta.json.stream.JsonGenerator;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.StringReader;
import java.io.StringWriter;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@ApplicationScoped
public class ApiClient {

    @ConfigProperty(name = "moussaillon.api.url")
    String apiUrl;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final JsonWriterFactory prettyWriterFactory = Json.createWriterFactory(
            Map.of(JsonGenerator.PRETTY_PRINTING, true));

    public String get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl + path))
                .header("Accept", "application/json")
                .GET()
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        checkResponse(response);
        return response.body();
    }

    public String post(String path, String jsonBody) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl + path))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        checkResponse(response);
        return response.body();
    }

    public String put(String path, String jsonBody) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl + path))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        checkResponse(response);
        return response.body();
    }

    public String mergeAndPut(String path, String partialJson) throws Exception {
        String existing = get(path);
        try (JsonReader existingReader = Json.createReader(new StringReader(existing));
             JsonReader partialReader = Json.createReader(new StringReader(partialJson))) {
            JsonObject existingObj = existingReader.readObject();
            JsonObject partialObj = partialReader.readObject();
            JsonObjectBuilder merged = Json.createObjectBuilder();
            for (String key : existingObj.keySet()) {
                merged.add(key, existingObj.get(key));
            }
            for (String key : partialObj.keySet()) {
                merged.add(key, partialObj.get(key));
            }
            return put(path, merged.build().toString());
        }
    }

    public void delete(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl + path))
                .DELETE()
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        checkResponse(response);
    }

    public String encodeQuery(String query) {
        return URLEncoder.encode(query, StandardCharsets.UTF_8);
    }

    public String prettyPrint(String json) {
        if (json == null || json.isBlank()) {
            return "";
        }
        try (JsonReader reader = Json.createReader(new StringReader(json))) {
            JsonValue value = reader.readValue();
            StringWriter sw = new StringWriter();
            try (JsonWriter writer = prettyWriterFactory.createWriter(sw)) {
                if (value instanceof JsonArray) {
                    writer.writeArray(value.asJsonArray());
                } else if (value instanceof JsonObject) {
                    writer.writeObject(value.asJsonObject());
                } else {
                    return json;
                }
            }
            return sw.toString();
        }
    }

    public String formatTable(String json, String... fields) {
        try (JsonReader reader = Json.createReader(new StringReader(json))) {
            JsonValue value = reader.readValue();
            if (!(value instanceof JsonArray array)) {
                return prettyPrint(json);
            }
            if (array.isEmpty()) {
                return "(aucun résultat)";
            }

            int[] widths = new int[fields.length];
            for (int i = 0; i < fields.length; i++) {
                widths[i] = fields[i].toUpperCase().length();
            }
            String[][] rows = new String[array.size()][fields.length];
            for (int r = 0; r < array.size(); r++) {
                JsonObject obj = array.getJsonObject(r);
                for (int c = 0; c < fields.length; c++) {
                    String val = extractField(obj, fields[c]);
                    rows[r][c] = val;
                    widths[c] = Math.max(widths[c], val.length());
                }
            }

            StringBuilder sb = new StringBuilder();
            for (int c = 0; c < fields.length; c++) {
                if (c > 0) sb.append("  ");
                sb.append(String.format("%-" + widths[c] + "s", fields[c].toUpperCase()));
            }
            sb.append("\n");
            for (int c = 0; c < fields.length; c++) {
                if (c > 0) sb.append("  ");
                sb.append("-".repeat(widths[c]));
            }
            sb.append("\n");
            for (String[] row : rows) {
                for (int c = 0; c < fields.length; c++) {
                    if (c > 0) sb.append("  ");
                    sb.append(String.format("%-" + widths[c] + "s", row[c]));
                }
                sb.append("\n");
            }
            return sb.toString();
        }
    }

    private String extractField(JsonObject obj, String field) {
        if (!obj.containsKey(field) || obj.isNull(field)) {
            return "";
        }
        JsonValue val = obj.get(field);
        return switch (val.getValueType()) {
            case STRING -> obj.getString(field);
            case NUMBER -> obj.getJsonNumber(field).toString();
            case TRUE -> "true";
            case FALSE -> "false";
            default -> val.toString();
        };
    }

    private void checkResponse(HttpResponse<String> response) throws Exception {
        if (response.statusCode() >= 400) {
            String body = response.body();
            String message = "Erreur HTTP " + response.statusCode();
            if (body != null && !body.isBlank()) {
                message += " : " + body;
            }
            throw new RuntimeException(message);
        }
    }
}
