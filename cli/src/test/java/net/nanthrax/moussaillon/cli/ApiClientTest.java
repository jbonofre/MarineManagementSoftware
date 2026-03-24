package net.nanthrax.moussaillon.cli;

import com.github.tomakehurst.wiremock.WireMockServer;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@QuarkusTestResource(WireMockResource.class)
class ApiClientTest {

    @InjectWireMock
    WireMockServer wireMock;

    @Inject
    ApiClient api;

    @BeforeEach
    void resetStubs() {
        wireMock.resetAll();
    }

    @Test
    void testPrettyPrintObjet() {
        String json = "{\"id\":1,\"nom\":\"Dupont\"}";
        String result = api.prettyPrint(json);
        assertTrue(result.contains("\"id\""));
        assertTrue(result.contains("\"nom\""));
        assertTrue(result.contains("Dupont"));
    }

    @Test
    void testPrettyPrintTableau() {
        String json = "[{\"id\":1},{\"id\":2}]";
        String result = api.prettyPrint(json);
        assertTrue(result.startsWith("["));
        assertTrue(result.contains("\"id\""));
    }

    @Test
    void testPrettyPrintVide() {
        assertEquals("", api.prettyPrint(""));
        assertEquals("", api.prettyPrint(null));
    }

    @Test
    void testFormatTableAffichage() {
        String json = "[{\"id\":1,\"nom\":\"Dupont\",\"email\":\"jean@test.com\"},{\"id\":2,\"nom\":\"Martin\",\"email\":\"paul@test.com\"}]";
        String result = api.formatTable(json, "id", "nom", "email");
        assertTrue(result.contains("ID"));
        assertTrue(result.contains("NOM"));
        assertTrue(result.contains("EMAIL"));
        assertTrue(result.contains("Dupont"));
        assertTrue(result.contains("Martin"));
        assertTrue(result.contains("jean@test.com"));
        assertTrue(result.contains("---"));
    }

    @Test
    void testFormatTableVide() {
        String result = api.formatTable("[]", "id", "nom");
        assertEquals("(aucun résultat)", result);
    }

    @Test
    void testFormatTableChampManquant() {
        String json = "[{\"id\":1,\"nom\":\"Dupont\"}]";
        String result = api.formatTable(json, "id", "nom", "email");
        assertTrue(result.contains("Dupont"));
        assertTrue(result.contains("EMAIL"));
    }

    @Test
    void testFormatTableTypes() {
        String json = "[{\"id\":1,\"nom\":\"Test\",\"actif\":true,\"score\":9.5}]";
        String result = api.formatTable(json, "id", "nom", "actif", "score");
        assertTrue(result.contains("true"));
        assertTrue(result.contains("9.5"));
    }

    @Test
    void testEncodeQuery() {
        assertEquals("hello+world", api.encodeQuery("hello world"));
        assertEquals("caf%C3%A9", api.encodeQuery("café"));
    }

    @Test
    void testGetRequeteHttp() throws Exception {
        wireMock.stubFor(get(urlEqualTo("/test"))
                .willReturn(okJson("{\"ok\":true}")));

        String response = api.get("/test");
        assertEquals("{\"ok\":true}", response);
    }

    @Test
    void testPostRequeteHttp() throws Exception {
        wireMock.stubFor(post(urlEqualTo("/test"))
                .willReturn(okJson("{\"id\":1}")));

        String response = api.post("/test", "{\"nom\":\"test\"}");
        assertTrue(response.contains("\"id\":1"));
        wireMock.verify(postRequestedFor(urlEqualTo("/test"))
                .withRequestBody(containing("\"nom\":\"test\"")));
    }

    @Test
    void testPutRequeteHttp() throws Exception {
        wireMock.stubFor(put(urlEqualTo("/test/1"))
                .willReturn(okJson("{\"id\":1,\"nom\":\"modifie\"}")));

        String response = api.put("/test/1", "{\"nom\":\"modifie\"}");
        assertTrue(response.contains("modifie"));
    }

    @Test
    void testDeleteRequeteHttp() throws Exception {
        wireMock.stubFor(delete(urlEqualTo("/test/1"))
                .willReturn(noContent()));

        api.delete("/test/1");
        wireMock.verify(deleteRequestedFor(urlEqualTo("/test/1")));
    }

    @Test
    void testErreur404() {
        wireMock.stubFor(get(urlEqualTo("/absent"))
                .willReturn(aResponse().withStatus(404).withBody("Non trouvé")));

        Exception ex = assertThrows(RuntimeException.class, () -> api.get("/absent"));
        assertTrue(ex.getMessage().contains("404"));
        assertTrue(ex.getMessage().contains("Non trouvé"));
    }

    @Test
    void testErreur500() {
        wireMock.stubFor(get(urlEqualTo("/erreur"))
                .willReturn(aResponse().withStatus(500).withBody("Erreur interne")));

        Exception ex = assertThrows(RuntimeException.class, () -> api.get("/erreur"));
        assertTrue(ex.getMessage().contains("500"));
    }

    @Test
    void testMergeAndPut() throws Exception {
        wireMock.stubFor(get(urlEqualTo("/items/1"))
                .willReturn(okJson("{\"id\":1,\"nom\":\"Ancien\",\"email\":\"old@test.com\",\"actif\":true}")));
        wireMock.stubFor(put(urlEqualTo("/items/1"))
                .willReturn(okJson("{\"id\":1,\"nom\":\"Nouveau\",\"email\":\"old@test.com\",\"actif\":true}")));

        String response = api.mergeAndPut("/items/1", "{\"nom\":\"Nouveau\"}");
        assertTrue(response.contains("Nouveau"));

        wireMock.verify(getRequestedFor(urlEqualTo("/items/1")));
        wireMock.verify(putRequestedFor(urlEqualTo("/items/1"))
                .withRequestBody(containing("\"nom\":\"Nouveau\""))
                .withRequestBody(containing("\"email\":\"old@test.com\""))
                .withRequestBody(containing("\"actif\":true")));
    }

    @Test
    void testMergeAndPutEcrase() throws Exception {
        wireMock.stubFor(get(urlEqualTo("/items/1"))
                .willReturn(okJson("{\"id\":1,\"nom\":\"Ancien\",\"stock\":5}")));
        wireMock.stubFor(put(urlEqualTo("/items/1"))
                .willReturn(okJson("{\"id\":1,\"nom\":\"Ancien\",\"stock\":0}")));

        api.mergeAndPut("/items/1", "{\"stock\":0}");

        wireMock.verify(putRequestedFor(urlEqualTo("/items/1"))
                .withRequestBody(containing("\"stock\":0"))
                .withRequestBody(containing("\"nom\":\"Ancien\"")));
    }
}
