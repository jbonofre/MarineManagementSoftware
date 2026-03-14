package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class AiChatResourceTest {

    @Test
    void testFournisseurManquant() {
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
    void testFournisseurVide() {
        given()
            .contentType("application/json")
            .body("{\"provider\":\"\",\"message\":\"Bonjour\"}")
            .when().post("/ai/chat")
            .then()
            .statusCode(400)
            .body("error", is("INVALID_REQUEST"));
    }

    @Test
    void testMessageManquant() {
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
    void testMessageVide() {
        given()
            .contentType("application/json")
            .body("{\"provider\":\"anthropic\",\"message\":\"\"}")
            .when().post("/ai/chat")
            .then()
            .statusCode(400)
            .body("error", is("INVALID_REQUEST"));
    }

    @Test
    void testFournisseurInvalide() {
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
    void testAppelOpenAiAvecClefTest() {
        // Avec la clef de test, l'appel a l'API OpenAI echouera (401/erreur de connexion)
        // Cela teste la construction de la requete et la gestion des erreurs
        given()
            .contentType("application/json")
            .body("{\"provider\":\"openai\",\"message\":\"test\"}")
            .when().post("/ai/chat")
            .then()
            .statusCode(anyOf(is(500), is(502)))
            .body("error", anyOf(is("AI_PROVIDER_ERROR"), is("AI_INTERNAL_ERROR")));
    }

    @Test
    void testAppelAnthropicAvecClefTest() {
        // Avec la clef de test, l'appel a l'API Anthropic echouera (401/erreur de connexion)
        // Cela teste la construction de la requete et la gestion des erreurs
        given()
            .contentType("application/json")
            .body("{\"provider\":\"anthropic\",\"message\":\"test\"}")
            .when().post("/ai/chat")
            .then()
            .statusCode(anyOf(is(500), is(502)))
            .body("error", anyOf(is("AI_PROVIDER_ERROR"), is("AI_INTERNAL_ERROR")));
    }

    @Test
    void testFournisseurInsensibleCasse() {
        // "OpenAI" doit etre normalise en "openai"
        given()
            .contentType("application/json")
            .body("{\"provider\":\"OpenAI\",\"message\":\"test\"}")
            .when().post("/ai/chat")
            .then()
            // Doit tenter l'appel (pas de retour INVALID_PROVIDER)
            .statusCode(anyOf(is(200), is(500), is(502)));
    }
}
