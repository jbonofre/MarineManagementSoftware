package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class FournisseurProduitResourceTest {

    @Test
    void testListerTout() {
        given()
            .when().get("/fournisseur-produit")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirNonTrouve() {
        given()
            .when().get("/fournisseur-produit/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreerEtObtenir() {
        int id = given()
            .contentType("application/json")
            .body("{\"fournisseur\":{\"id\":100},\"produit\":{\"id\":100},\"reference\":\"REF-001\",\"prixAchatHT\":15.0,\"tva\":20.0}")
            .when().post("/fournisseur-produit")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .extract().path("id");

        given()
            .when().get("/fournisseur-produit/" + id)
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirParFournisseur() {
        given()
            .when().get("/fournisseur-produit/fournisseur/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirProduitsParFournisseur() {
        given()
            .when().get("/fournisseur-produit/fournisseur/100/produits")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirFournisseursParProduit() {
        given()
            .when().get("/fournisseur-produit/produit/100/fournisseurs")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirParProduit() {
        given()
            .when().get("/fournisseur-produit/produit/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testRechercher() {
        given()
            .when().get("/fournisseur-produit/search")
            .then()
            .statusCode(200);
    }

    @Test
    void testSupprimerNonTrouve() {
        given()
            .when().delete("/fournisseur-produit/9999")
            .then()
            .statusCode(404);
    }
}
