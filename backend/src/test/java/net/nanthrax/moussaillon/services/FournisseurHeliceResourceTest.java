package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class FournisseurHeliceResourceTest {

    @Test
    void testListerTout() {
        given()
            .when().get("/fournisseur-helice")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirNonTrouve() {
        given()
            .when().get("/fournisseur-helice/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreerEtObtenir() {
        int id = given()
            .contentType("application/json")
            .body("{\"fournisseur\":{\"id\":100},\"helice\":{\"id\":100},\"prixAchatHT\":200.0,\"tva\":20.0}")
            .when().post("/fournisseur-helice")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .extract().path("id");

        given()
            .when().get("/fournisseur-helice/" + id)
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirParFournisseur() {
        given()
            .when().get("/fournisseur-helice/fournisseur/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirHelicesParFournisseur() {
        given()
            .when().get("/fournisseur-helice/fournisseur/100/helices")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirFournisseursParHelice() {
        given()
            .when().get("/fournisseur-helice/helice/100/fournisseurs")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirParHelice() {
        given()
            .when().get("/fournisseur-helice/helice/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testRechercher() {
        given()
            .when().get("/fournisseur-helice/search")
            .then()
            .statusCode(200);
    }

    @Test
    void testSupprimerNonTrouve() {
        given()
            .when().delete("/fournisseur-helice/9999")
            .then()
            .statusCode(404);
    }
}
