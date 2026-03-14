package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class FournisseurHeliceResourceTest {

    @Test
    void testListAll() {
        given()
            .when().get("/fournisseur-helice")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetNotFound() {
        given()
            .when().get("/fournisseur-helice/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreateAndGet() {
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
    void testGetByFournisseur() {
        given()
            .when().get("/fournisseur-helice/fournisseur/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetHelicesByFournisseur() {
        given()
            .when().get("/fournisseur-helice/fournisseur/100/helices")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetFournisseursByHelice() {
        given()
            .when().get("/fournisseur-helice/helice/100/fournisseurs")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetByHelice() {
        given()
            .when().get("/fournisseur-helice/helice/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testSearch() {
        given()
            .when().get("/fournisseur-helice/search")
            .then()
            .statusCode(200);
    }

    @Test
    void testDeleteNotFound() {
        given()
            .when().delete("/fournisseur-helice/9999")
            .then()
            .statusCode(404);
    }
}
