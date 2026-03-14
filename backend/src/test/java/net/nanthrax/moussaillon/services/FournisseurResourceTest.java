package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class FournisseurResourceTest {

    @Test
    void testListerFournisseurs() {
        given()
            .when().get("/catalogue/fournisseurs")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testObtenirFournisseur() {
        given()
            .when().get("/catalogue/fournisseurs/100")
            .then()
            .statusCode(200)
            .body("nom", is("Marine Parts SA"));
    }

    @Test
    void testObtenirFournisseurNonTrouve() {
        given()
            .when().get("/catalogue/fournisseurs/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreerFournisseur() {
        given()
            .contentType("application/json")
            .body("{\"nom\":\"Nouveau Fournisseur\",\"email\":\"new@fournisseur.com\",\"telephone\":\"0400009999\"}")
            .when().post("/catalogue/fournisseurs")
            .then()
            .statusCode(200)
            .body("nom", is("Nouveau Fournisseur"))
            .body("id", notNullValue());
    }

    @Test
    void testModifierFournisseur() {
        int id = given()
            .contentType("application/json")
            .body("{\"nom\":\"AvantUpdateFourn\",\"email\":\"avant@test.com\"}")
            .when().post("/catalogue/fournisseurs")
            .then().statusCode(200).extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"nom\":\"ApresUpdateFourn\",\"email\":\"apres@test.com\"}")
            .when().put("/catalogue/fournisseurs/" + id)
            .then()
            .statusCode(200)
            .body("nom", is("ApresUpdateFourn"));
    }

    @Test
    void testRechercherFournisseurs() {
        given()
            .queryParam("q", "marine")
            .when().get("/catalogue/fournisseurs/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testSupprimerFournisseur() {
        int id = given()
            .contentType("application/json")
            .body("{\"nom\":\"ToDeleteFourn\",\"email\":\"del@test.com\"}")
            .when().post("/catalogue/fournisseurs")
            .then().statusCode(200).extract().path("id");

        given()
            .when().delete("/catalogue/fournisseurs/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/catalogue/fournisseurs/" + id)
            .then()
            .statusCode(404);
    }
}
