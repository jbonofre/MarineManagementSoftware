package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class FournisseurBateauResourceTest {

    @Test
    void testListerTout() {
        given()
            .when().get("/fournisseur-bateau")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirNonTrouve() {
        given()
            .when().get("/fournisseur-bateau/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreerEtObtenir() {
        int id = given()
            .contentType("application/json")
            .body("{\"fournisseur\":{\"id\":100},\"bateau\":{\"id\":100},\"prixAchatHT\":18000.0,\"tva\":20.0}")
            .when().post("/fournisseur-bateau")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .extract().path("id");

        given()
            .when().get("/fournisseur-bateau/" + id)
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirParFournisseur() {
        given()
            .when().get("/fournisseur-bateau/fournisseur/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirParBateau() {
        given()
            .when().get("/fournisseur-bateau/bateau/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testRechercher() {
        given()
            .when().get("/fournisseur-bateau/search")
            .then()
            .statusCode(200);
    }

    @Test
    void testSupprimerNonTrouve() {
        given()
            .when().delete("/fournisseur-bateau/9999")
            .then()
            .statusCode(404);
    }
}
