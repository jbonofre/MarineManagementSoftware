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
class FournisseurCommandTest {

    @InjectWireMock
    WireMockServer wireMock;

    @Inject
    CommandLine.IFactory factory;

    @BeforeEach
    void resetStubs() {
        wireMock.resetAll();
    }

    @Test
    void testListerFournisseursViaCommande() {
        wireMock.stubFor(get(urlEqualTo("/catalogue/fournisseurs"))
                .willReturn(okJson("[{\"id\":1,\"nom\":\"Accastillage Diffusion\"}]")));

        int exitCode = new CommandLine(FournisseurCommand.List.class, factory).execute();
        assertEquals(0, exitCode);
    }

    @Test
    void testListerFournisseursJson() {
        wireMock.stubFor(get(urlEqualTo("/catalogue/fournisseurs"))
                .willReturn(okJson("[{\"id\":1,\"nom\":\"Accastillage\"}]")));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintStream original = System.out;
        System.setOut(new PrintStream(out));
        try {
            new CommandLine(FournisseurCommand.List.class, factory).execute("--json");
        } finally {
            System.setOut(original);
        }
        assertTrue(out.toString().contains("\"nom\""));
    }

    @Test
    void testObtenirFournisseurViaCommande() {
        wireMock.stubFor(get(urlEqualTo("/catalogue/fournisseurs/1"))
                .willReturn(okJson("{\"id\":1,\"nom\":\"Accastillage Diffusion\"}")));

        int exitCode = new CommandLine(FournisseurCommand.Get.class, factory).execute("1");
        assertEquals(0, exitCode);
    }

    @Test
    void testRechercherFournisseursViaCommande() {
        wireMock.stubFor(get(urlPathEqualTo("/catalogue/fournisseurs/search"))
                .willReturn(okJson("[{\"id\":1,\"nom\":\"Accastillage Diffusion\"}]")));

        int exitCode = new CommandLine(FournisseurCommand.Search.class, factory).execute("accastillage");
        assertEquals(0, exitCode);
    }

    @Test
    void testCreerFournisseurViaCommande() {
        wireMock.stubFor(post(urlEqualTo("/catalogue/fournisseurs"))
                .willReturn(okJson("{\"id\":5,\"nom\":\"Nouveau\",\"siren\":\"123456789\"}")));

        int exitCode = new CommandLine(FournisseurCommand.Create.class, factory)
                .execute("--nom", "Nouveau", "--siren", "123456789", "--email", "contact@test.com");
        assertEquals(0, exitCode);
        wireMock.verify(postRequestedFor(urlEqualTo("/catalogue/fournisseurs"))
                .withRequestBody(containing("\"siren\":\"123456789\"")));
    }

    @Test
    void testModifierFournisseurViaCommande() {
        wireMock.stubFor(get(urlEqualTo("/catalogue/fournisseurs/1"))
                .willReturn(okJson("{\"id\":1,\"nom\":\"Ancien\",\"email\":\"old@test.com\",\"telephone\":\"0102030405\"}")));
        wireMock.stubFor(put(urlEqualTo("/catalogue/fournisseurs/1"))
                .willReturn(okJson("{\"id\":1,\"nom\":\"Modifie\",\"email\":\"old@test.com\",\"telephone\":\"0102030405\",\"siret\":\"12345678900001\"}")));

        int exitCode = new CommandLine(FournisseurCommand.Update.class, factory)
                .execute("1", "--nom", "Modifie", "--siret", "12345678900001");
        assertEquals(0, exitCode);
        wireMock.verify(getRequestedFor(urlEqualTo("/catalogue/fournisseurs/1")));
        wireMock.verify(putRequestedFor(urlEqualTo("/catalogue/fournisseurs/1"))
                .withRequestBody(containing("\"nom\":\"Modifie\""))
                .withRequestBody(containing("\"siret\":\"12345678900001\""))
                .withRequestBody(containing("\"email\":\"old@test.com\"")));
    }

    @Test
    void testSupprimerFournisseurViaCommande() {
        wireMock.stubFor(delete(urlEqualTo("/catalogue/fournisseurs/1"))
                .willReturn(noContent()));

        int exitCode = new CommandLine(FournisseurCommand.Delete.class, factory).execute("1");
        assertEquals(0, exitCode);
    }

    @Test
    void testFournisseurNonTrouveViaCommande() {
        wireMock.stubFor(get(urlEqualTo("/catalogue/fournisseurs/9999"))
                .willReturn(aResponse().withStatus(404)));

        ByteArrayOutputStream err = new ByteArrayOutputStream();
        PrintStream original = System.err;
        System.setErr(new PrintStream(err));
        try {
            int exitCode = new CommandLine(FournisseurCommand.Get.class, factory).execute("9999");
            assertEquals(0, exitCode);
        } finally {
            System.setErr(original);
        }
        assertTrue(err.toString().contains("Erreur"));
    }
}
