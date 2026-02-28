package net.nanthrax.mms.services;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;

@Path("/ai/chat")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AiChatResource {

    @ConfigProperty(name = "ai.openai.api-key", defaultValue = "")
    String openAiApiKey;

    @ConfigProperty(name = "ai.anthropic.api-key", defaultValue = "")
    String anthropicApiKey;

    @ConfigProperty(name = "ai.openai.model", defaultValue = "gpt-4o-mini")
    String openAiModel;

    @ConfigProperty(name = "ai.anthropic.model", defaultValue = "claude-3-5-haiku-latest")
    String anthropicModel;

    private final Jsonb jsonb = JsonbBuilder.create();

    @POST
    public Map<String, Object> chat(Map<String, Object> request) {
        String provider = asString(request.get("provider"));
        String message = asString(request.get("message"));

        if (provider == null || provider.trim().isEmpty()) {
            throw new WebApplicationException("Le champ 'provider' est requis", 400);
        }
        if (message == null || message.trim().isEmpty()) {
            throw new WebApplicationException("Le champ 'message' est requis", 400);
        }

        String normalizedProvider = provider.trim().toLowerCase();
        if ("openai".equals(normalizedProvider)) {
            return callOpenAi(message);
        }
        if ("anthropic".equals(normalizedProvider)) {
            return callAnthropic(message);
        }
        throw new WebApplicationException("Provider inconnu: " + provider + ". Utilisez 'openai' ou 'anthropic'.", 400);
    }

    private Map<String, Object> callOpenAi(String userMessage) {
        if (openAiApiKey == null || openAiApiKey.trim().isEmpty()) {
            throw new WebApplicationException("La clé OpenAI est absente (ai.openai.api-key)", 500);
        }

        Map<String, Object> system = new LinkedHashMap<String, Object>();
        system.put("role", "system");
        system.put("content",
                "Tu es un assistant MMS (chantier naval). Réponds en français, clairement et brièvement.");

        Map<String, Object> user = new LinkedHashMap<String, Object>();
        user.put("role", "user");
        user.put("content", userMessage);

        List<Map<String, Object>> messages = new ArrayList<Map<String, Object>>();
        messages.add(system);
        messages.add(user);

        Map<String, Object> payload = new LinkedHashMap<String, Object>();
        payload.put("model", openAiModel);
        payload.put("temperature", Double.valueOf(0.2));
        payload.put("messages", messages);

        String responseBody = callJsonApi(
                "https://api.openai.com/v1/chat/completions",
                "POST",
                payload,
                buildHeaders("Authorization", "Bearer " + openAiApiKey));

        Map<String, Object> parsed = fromJsonMap(responseBody);
        String answer = extractOpenAiAnswer(parsed);

        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("provider", "openai");
        response.put("model", openAiModel);
        response.put("answer", answer);
        return response;
    }

    private Map<String, Object> callAnthropic(String userMessage) {
        if (anthropicApiKey == null || anthropicApiKey.trim().isEmpty()) {
            throw new WebApplicationException("La clé Anthropic est absente (ai.anthropic.api-key)", 500);
        }

        Map<String, Object> user = new LinkedHashMap<String, Object>();
        user.put("role", "user");
        user.put("content", userMessage);

        List<Map<String, Object>> messages = new ArrayList<Map<String, Object>>();
        messages.add(user);

        Map<String, Object> payload = new LinkedHashMap<String, Object>();
        payload.put("model", anthropicModel);
        payload.put("max_tokens", Integer.valueOf(700));
        payload.put("system", "Tu es un assistant MMS (chantier naval). Réponds en français, clairement et brièvement.");
        payload.put("messages", messages);

        String responseBody = callJsonApi(
                "https://api.anthropic.com/v1/messages",
                "POST",
                payload,
                buildHeaders(
                        "x-api-key", anthropicApiKey,
                        "anthropic-version", "2023-06-01"));

        Map<String, Object> parsed = fromJsonMap(responseBody);
        String answer = extractAnthropicAnswer(parsed);

        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("provider", "anthropic");
        response.put("model", anthropicModel);
        response.put("answer", answer);
        return response;
    }

    private String callJsonApi(String endpoint, String method, Map<String, Object> payload, Map<String, String> headers) {
        HttpURLConnection connection = null;
        try {
            connection = (HttpURLConnection) new URL(endpoint).openConnection();
            connection.setRequestMethod(method);
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Accept", "application/json");
            for (Map.Entry<String, String> header : headers.entrySet()) {
                connection.setRequestProperty(header.getKey(), header.getValue());
            }

            byte[] payloadBytes = jsonb.toJson(payload).getBytes(StandardCharsets.UTF_8);
            OutputStream outputStream = connection.getOutputStream();
            try {
                outputStream.write(payloadBytes);
                outputStream.flush();
            } finally {
                outputStream.close();
            }

            int status = connection.getResponseCode();
            String body = readResponseBody(connection, status);
            if (status >= 400) {
                throw new WebApplicationException("Erreur fournisseur IA (" + status + "): " + body, 502);
            }
            return body;
        } catch (IOException e) {
            throw new WebApplicationException("Erreur d'appel fournisseur IA: " + e.getMessage(), 502);
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private String readResponseBody(HttpURLConnection connection, int status) throws IOException {
        InputStream inputStream = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
        if (inputStream == null) {
            return "";
        }

        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
        try {
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                body.append(line);
            }
            return body.toString();
        } finally {
            reader.close();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fromJsonMap(String content) {
        Object parsed = jsonb.fromJson(content, Object.class);
        if (!(parsed instanceof Map<?, ?>)) {
            return new LinkedHashMap<String, Object>();
        }
        return (Map<String, Object>) parsed;
    }

    private String extractOpenAiAnswer(Map<String, Object> response) {
        Object choicesObj = response.get("choices");
        if (!(choicesObj instanceof List<?>)) {
            return "Aucune réponse renvoyée par OpenAI.";
        }
        List<?> choices = (List<?>) choicesObj;
        if (choices.isEmpty()) {
            return "Aucune réponse renvoyée par OpenAI.";
        }
        Object firstChoice = choices.get(0);
        if (!(firstChoice instanceof Map<?, ?>)) {
            return "Aucune réponse renvoyée par OpenAI.";
        }
        Object messageObj = ((Map<?, ?>) firstChoice).get("message");
        if (!(messageObj instanceof Map<?, ?>)) {
            return "Aucune réponse renvoyée par OpenAI.";
        }
        Object contentObj = ((Map<?, ?>) messageObj).get("content");
        return contentObj == null ? "Aucune réponse renvoyée par OpenAI." : contentObj.toString();
    }

    private String extractAnthropicAnswer(Map<String, Object> response) {
        Object contentObj = response.get("content");
        if (!(contentObj instanceof List<?>)) {
            return "Aucune réponse renvoyée par Anthropic.";
        }
        List<?> blocks = (List<?>) contentObj;
        if (blocks.isEmpty()) {
            return "Aucune réponse renvoyée par Anthropic.";
        }

        StringBuilder answer = new StringBuilder();
        for (Object block : blocks) {
            if (!(block instanceof Map<?, ?>)) {
                continue;
            }
            Object type = ((Map<?, ?>) block).get("type");
            if (type == null || !"text".equals(type.toString())) {
                continue;
            }
            Object text = ((Map<?, ?>) block).get("text");
            if (text != null) {
                if (answer.length() > 0) {
                    answer.append("\n");
                }
                answer.append(text.toString());
            }
        }

        if (answer.length() == 0) {
            return "Aucune réponse renvoyée par Anthropic.";
        }
        return answer.toString();
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private Map<String, String> buildHeaders(String... items) {
        Map<String, String> headers = new LinkedHashMap<String, String>();
        for (int i = 0; i + 1 < items.length; i += 2) {
            headers.put(items[i], items[i + 1]);
        }
        return headers;
    }
}
