package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class FournisseurRemorqueResourceTest {

    @Test
    void testListerTout() {
        given()
            .when().get("/fournisseur-remorque")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirNonTrouve() {
        given()
            .when().get("/fournisseur-remorque/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreerEtObtenir() {
        int id = given()
            .contentType("application/json")
            .body("{\"fournisseur\":{\"id\":100},\"remorque\":{\"id\":100},\"prixAchatHT\":1500.0,\"tva\":20.0}")
            .when().post("/fournisseur-remorque")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .extract().path("id");

        given()
            .when().get("/fournisseur-remorque/" + id)
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirParFournisseur() {
        given()
            .when().get("/fournisseur-remorque/fournisseur/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirRemorquesParFournisseur() {
        given()
            .when().get("/fournisseur-remorque/fournisseur/100/remorques")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirFournisseursParRemorque() {
        given()
            .when().get("/fournisseur-remorque/remorque/100/fournisseurs")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirParRemorque() {
        given()
            .when().get("/fournisseur-remorque/remorque/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testRechercher() {
        given()
            .when().get("/fournisseur-remorque/search")
            .then()
            .statusCode(200);
    }

    @Test
    void testSupprimerNonTrouve() {
        given()
            .when().delete("/fournisseur-remorque/9999")
            .then()
            .statusCode(404);
    }
}
