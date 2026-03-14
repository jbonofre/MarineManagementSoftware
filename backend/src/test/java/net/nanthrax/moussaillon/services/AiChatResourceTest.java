package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class AiChatResourceTest {

    @Test
    void testMissingProvider() {
        given()
            .contentType("application/json")
            .body("{\"message\":\"Bonjour\"}")
            .when().post("/ai/chat")
            .then()
            .statusCode(400)
            .body("error", is("INVALID_REQUEST"))
            .body("message", containsString("provider"));
    }

    @Test
    void testEmptyProvider() {
        given()
            .contentType("application/json")
            .body("{\"provider\":\"\",\"message\":\"Bonjour\"}")
            .when().post("/ai/chat")
            .then()
            .statusCode(400)
            .body("error", is("INVALID_REQUEST"));
    }

    @Test
    void testMissingMessage() {
        given()
            .contentType("application/json")
            .body("{\"provider\":\"openai\"}")
            .when().post("/ai/chat")
            .then()
            .statusCode(400)
            .body("error", is("INVALID_REQUEST"))
            .body("message", containsString("message"))
            .body("provider", is("openai"));
    }

    @Test
    void testEmptyMessage() {
        given()
            .contentType("application/json")
            .body("{\"provider\":\"anthropic\",\"message\":\"\"}")
            .when().post("/ai/chat")
            .then()
            .statusCode(400)
            .body("error", is("INVALID_REQUEST"));
    }

    @Test
    void testInvalidProvider() {
        given()
            .contentType("application/json")
            .body("{\"provider\":\"gemini\",\"message\":\"Bonjour\"}")
            .when().post("/ai/chat")
            .then()
            .statusCode(400)
            .body("error", is("INVALID_PROVIDER"))
            .body("message", containsString("gemini"))
            .body("provider", is("gemini"));
    }

    @Test
    void testOpenAiCallWithTestKey() {
        // With test-key, the call to OpenAI API will fail (401/connection error)
        // This exercises the request building + error handling code paths
        given()
            .contentType("application/json")
            .body("{\"provider\":\"openai\",\"message\":\"test\"}")
            .when().post("/ai/chat")
            .then()
            .statusCode(anyOf(is(500), is(502)))
            .body("error", anyOf(is("AI_PROVIDER_ERROR"), is("AI_INTERNAL_ERROR")));
    }

    @Test
    void testAnthropicCallWithTestKey() {
        // With test-key, the call to Anthropic API will fail (401/connection error)
        // This exercises the request building + error handling code paths
        given()
            .contentType("application/json")
            .body("{\"provider\":\"anthropic\",\"message\":\"test\"}")
            .when().post("/ai/chat")
            .then()
            .statusCode(anyOf(is(500), is(502)))
            .body("error", anyOf(is("AI_PROVIDER_ERROR"), is("AI_INTERNAL_ERROR")));
    }

    @Test
    void testProviderCaseInsensitive() {
        // "OpenAI" should be normalized to "openai"
        given()
            .contentType("application/json")
            .body("{\"provider\":\"OpenAI\",\"message\":\"test\"}")
            .when().post("/ai/chat")
            .then()
            // Should attempt the call (not return INVALID_PROVIDER)
            .statusCode(anyOf(is(200), is(500), is(502)));
    }
}
