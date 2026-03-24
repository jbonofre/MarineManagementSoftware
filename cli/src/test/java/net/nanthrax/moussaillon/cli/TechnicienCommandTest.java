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
class TechnicienCommandTest {

    @InjectWireMock
    WireMockServer wireMock;

    @Inject
    CommandLine.IFactory factory;

    @BeforeEach
    void resetStubs() {
        wireMock.resetAll();
    }

    @Test
    void testListerTechniciensViaCommande() {
        wireMock.stubFor(get(urlEqualTo("/techniciens"))
                .willReturn(okJson("[{\"id\":1,\"nom\":\"Martin\",\"prenom\":\"Pierre\"}]")));

        int exitCode = new CommandLine(TechnicienCommand.List.class, factory).execute();
        assertEquals(0, exitCode);
    }

    @Test
    void testListerTechniciensJson() {
        wireMock.stubFor(get(urlEqualTo("/techniciens"))
                .willReturn(okJson("[{\"id\":1,\"nom\":\"Martin\"}]")));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintStream original = System.out;
        System.setOut(new PrintStream(out));
        try {
            new CommandLine(TechnicienCommand.List.class, factory).execute("--json");
        } finally {
            System.setOut(original);
        }
        assertTrue(out.toString().contains("\"nom\""));
    }

    @Test
    void testObtenirTechnicienViaCommande() {
        wireMock.stubFor(get(urlEqualTo("/techniciens/1"))
                .willReturn(okJson("{\"id\":1,\"nom\":\"Martin\",\"prenom\":\"Pierre\"}")));

        int exitCode = new CommandLine(TechnicienCommand.Get.class, factory).execute("1");
        assertEquals(0, exitCode);
    }

    @Test
    void testRechercherTechniciensViaCommande() {
        wireMock.stubFor(get(urlPathEqualTo("/techniciens/search"))
                .willReturn(okJson("[{\"id\":1,\"nom\":\"Martin\"}]")));

        int exitCode = new CommandLine(TechnicienCommand.Search.class, factory).execute("martin");
        assertEquals(0, exitCode);
    }

    @Test
    void testCreerTechnicienViaCommande() {
        wireMock.stubFor(post(urlEqualTo("/techniciens"))
                .willReturn(okJson("{\"id\":5,\"nom\":\"Durand\",\"prenom\":\"Luc\",\"couleur\":\"#3498db\"}")));

        int exitCode = new CommandLine(TechnicienCommand.Create.class, factory)
                .execute("--nom", "Durand", "--prenom", "Luc", "--couleur", "#3498db");
        assertEquals(0, exitCode);
        wireMock.verify(postRequestedFor(urlEqualTo("/techniciens"))
                .withRequestBody(containing("\"nom\":\"Durand\""))
                .withRequestBody(containing("\"couleur\":\"#3498db\"")));
    }

    @Test
    void testModifierTechnicienViaCommande() {
        wireMock.stubFor(get(urlEqualTo("/techniciens/1"))
                .willReturn(okJson("{\"id\":1,\"nom\":\"Martin\",\"prenom\":\"Pierre\",\"email\":\"old@test.com\",\"couleur\":\"#000\"}")));
        wireMock.stubFor(put(urlEqualTo("/techniciens/1"))
                .willReturn(okJson("{\"id\":1,\"nom\":\"Martin\",\"prenom\":\"Pierre\",\"email\":\"new@test.com\",\"couleur\":\"#e74c3c\"}")));

        int exitCode = new CommandLine(TechnicienCommand.Update.class, factory)
                .execute("1", "--email", "new@test.com", "--couleur", "#e74c3c");
        assertEquals(0, exitCode);
        wireMock.verify(getRequestedFor(urlEqualTo("/techniciens/1")));
        wireMock.verify(putRequestedFor(urlEqualTo("/techniciens/1"))
                .withRequestBody(containing("\"email\":\"new@test.com\""))
                .withRequestBody(containing("\"nom\":\"Martin\""))
                .withRequestBody(containing("\"prenom\":\"Pierre\"")));
    }

    @Test
    void testSupprimerTechnicienViaCommande() {
        wireMock.stubFor(delete(urlEqualTo("/techniciens/1"))
                .willReturn(noContent()));

        int exitCode = new CommandLine(TechnicienCommand.Delete.class, factory).execute("1");
        assertEquals(0, exitCode);
    }

    @Test
    void testTechnicienNonTrouveViaCommande() {
        wireMock.stubFor(get(urlEqualTo("/techniciens/9999"))
                .willReturn(aResponse().withStatus(404)));

        ByteArrayOutputStream err = new ByteArrayOutputStream();
        PrintStream original = System.err;
        System.setErr(new PrintStream(err));
        try {
            int exitCode = new CommandLine(TechnicienCommand.Get.class, factory).execute("9999");
            assertEquals(0, exitCode);
        } finally {
            System.setErr(original);
        }
        assertTrue(err.toString().contains("Erreur"));
    }
}
