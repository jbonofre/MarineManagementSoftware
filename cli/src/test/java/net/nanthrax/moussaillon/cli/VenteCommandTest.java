package net.nanthrax.moussaillon.cli;

import com.github.tomakehurst.wiremock.WireMockServer;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import picocli.CommandLine;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@QuarkusTestResource(WireMockResource.class)
class VenteCommandTest {

    @InjectWireMock
    WireMockServer wireMock;

    @Inject
    CommandLine.IFactory factory;

    @BeforeEach
    void resetStubs() {
        wireMock.resetAll();
    }

    @Test
    void testListerVentesViaCommande() {
        wireMock.stubFor(get(urlEqualTo("/ventes"))
                .willReturn(okJson("[{\"id\":1,\"type\":\"COMPTOIR\",\"status\":\"EN_ATTENTE\"}]")));

        int exitCode = new CommandLine(VenteCommand.List.class, factory).execute();
        assertEquals(0, exitCode);
    }

    @Test
    void testListerVentesJson() {
        wireMock.stubFor(get(urlEqualTo("/ventes"))
                .willReturn(okJson("[{\"id\":1,\"type\":\"COMPTOIR\"}]")));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintStream original = System.out;
        System.setOut(new PrintStream(out));
        try {
            new CommandLine(VenteCommand.List.class, factory).execute("--json");
        } finally {
            System.setOut(original);
        }
        assertTrue(out.toString().contains("\"type\""));
    }

    @Test
    void testObtenirVenteViaCommande() {
        wireMock.stubFor(get(urlEqualTo("/ventes/1"))
                .willReturn(okJson("{\"id\":1,\"type\":\"COMPTOIR\",\"status\":\"EN_ATTENTE\"}")));

        int exitCode = new CommandLine(VenteCommand.Get.class, factory).execute("1");
        assertEquals(0, exitCode);
    }

    @Test
    void testRechercherVentesParStatus() {
        wireMock.stubFor(get(urlPathEqualTo("/ventes/search"))
                .withQueryParam("status", equalTo("EN_ATTENTE"))
                .willReturn(okJson("[{\"id\":1,\"type\":\"COMPTOIR\",\"status\":\"EN_ATTENTE\"}]")));

        int exitCode = new CommandLine(VenteCommand.Search.class, factory)
                .execute("--status", "EN_ATTENTE");
        assertEquals(0, exitCode);
    }

    @Test
    void testRechercherVentesJson() {
        wireMock.stubFor(get(urlPathEqualTo("/ventes/search"))
                .willReturn(okJson("[{\"id\":1,\"type\":\"COMPTOIR\"}]")));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintStream original = System.out;
        System.setOut(new PrintStream(out));
        try {
            new CommandLine(VenteCommand.Search.class, factory).execute("--status", "EN_ATTENTE", "--json");
        } finally {
            System.setOut(original);
        }
        assertTrue(out.toString().contains("\"type\""));
    }

    @Test
    void testRechercherVentesFiltresCombines() {
        wireMock.stubFor(get(urlPathEqualTo("/ventes/search"))
                .willReturn(okJson("[{\"id\":1,\"type\":\"COMPTOIR\",\"status\":\"EN_ATTENTE\"}]")));

        int exitCode = new CommandLine(VenteCommand.Search.class, factory)
                .execute("--status", "EN_ATTENTE", "--type", "COMPTOIR", "--client-id", "1");
        assertEquals(0, exitCode);
        wireMock.verify(getRequestedFor(urlPathEqualTo("/ventes/search"))
                .withQueryParam("status", equalTo("EN_ATTENTE"))
                .withQueryParam("type", equalTo("COMPTOIR"))
                .withQueryParam("clientId", equalTo("1")));
    }

    @Test
    void testRechercherVentesSansFiltres() {
        wireMock.stubFor(get(urlEqualTo("/ventes/search"))
                .willReturn(okJson("[{\"id\":1,\"type\":\"COMPTOIR\"}]")));

        int exitCode = new CommandLine(VenteCommand.Search.class, factory).execute();
        assertEquals(0, exitCode);
        wireMock.verify(getRequestedFor(urlEqualTo("/ventes/search")));
    }

    @Test
    void testCreerVenteViaCommande() {
        wireMock.stubFor(post(urlEqualTo("/ventes"))
                .willReturn(aResponse().withStatus(201)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"id\":10,\"type\":\"COMPTOIR\",\"status\":\"EN_ATTENTE\"}")));

        int exitCode = new CommandLine(VenteCommand.Create.class, factory)
                .execute("--type", "COMPTOIR", "--client-id", "1", "--notes", "Test");
        assertEquals(0, exitCode);
        wireMock.verify(postRequestedFor(urlEqualTo("/ventes"))
                .withRequestBody(containing("\"type\":\"COMPTOIR\""))
                .withRequestBody(containing("\"client\""))
                .withRequestBody(containing("\"notes\":\"Test\"")));
    }

    @Test
    void testCreerVenteSansClient() {
        wireMock.stubFor(post(urlEqualTo("/ventes"))
                .willReturn(aResponse().withStatus(201)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"id\":11,\"type\":\"COMPTOIR\",\"status\":\"EN_ATTENTE\"}")));

        int exitCode = new CommandLine(VenteCommand.Create.class, factory)
                .execute("--type", "COMPTOIR");
        assertEquals(0, exitCode);
        wireMock.verify(postRequestedFor(urlEqualTo("/ventes"))
                .withRequestBody(containing("\"type\":\"COMPTOIR\""))
                .withRequestBody(notContaining("\"client\"")));
    }

    @Test
    void testModifierVenteViaCommande() {
        wireMock.stubFor(get(urlEqualTo("/ventes/1"))
                .willReturn(okJson("{\"id\":1,\"type\":\"COMPTOIR\",\"status\":\"EN_ATTENTE\",\"date\":\"2025-01-15\",\"notes\":\"old\"}")));
        wireMock.stubFor(put(urlEqualTo("/ventes/1"))
                .willReturn(okJson("{\"id\":1,\"type\":\"COMPTOIR\",\"status\":\"VALIDEE\",\"date\":\"2025-01-15\"}")));

        int exitCode = new CommandLine(VenteCommand.Update.class, factory)
                .execute("1", "--status", "VALIDEE", "--notes", "Mise à jour");
        assertEquals(0, exitCode);
        wireMock.verify(getRequestedFor(urlEqualTo("/ventes/1")));
        wireMock.verify(putRequestedFor(urlEqualTo("/ventes/1"))
                .withRequestBody(containing("\"status\":\"VALIDEE\""))
                .withRequestBody(containing("\"type\":\"COMPTOIR\""))
                .withRequestBody(containing("\"date\":\"2025-01-15\"")));
    }

    @Test
    void testSupprimerVenteViaCommande() {
        wireMock.stubFor(delete(urlEqualTo("/ventes/1"))
                .willReturn(noContent()));

        int exitCode = new CommandLine(VenteCommand.Delete.class, factory).execute("1");
        assertEquals(0, exitCode);
    }

    @Test
    void testVenteNonTrouveeViaCommande() {
        wireMock.stubFor(get(urlEqualTo("/ventes/9999"))
                .willReturn(aResponse().withStatus(404)));

        ByteArrayOutputStream err = new ByteArrayOutputStream();
        PrintStream original = System.err;
        System.setErr(new PrintStream(err));
        try {
            int exitCode = new CommandLine(VenteCommand.Get.class, factory).execute("9999");
            assertEquals(0, exitCode);
        } finally {
            System.setErr(original);
        }
        assertTrue(err.toString().contains("Erreur"));
    }
}
