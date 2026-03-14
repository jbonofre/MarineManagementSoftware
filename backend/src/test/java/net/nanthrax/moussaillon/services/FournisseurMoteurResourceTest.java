package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class FournisseurMoteurResourceTest {

    @Test
    void testListAll() {
        given()
            .when().get("/fournisseur-moteur")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetNotFound() {
        given()
            .when().get("/fournisseur-moteur/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreateAndGet() {
        int id = given()
            .contentType("application/json")
            .body("{\"fournisseur\":{\"id\":100},\"moteur\":{\"id\":100},\"prixAchatHT\":8000.0,\"tva\":20.0}")
            .when().post("/fournisseur-moteur")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .extract().path("id");

        given()
            .when().get("/fournisseur-moteur/" + id)
            .then()
            .statusCode(200);
    }

    @Test
    void testGetByFournisseur() {
        given()
            .when().get("/fournisseur-moteur/fournisseur/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetMoteursByFournisseur() {
        given()
            .when().get("/fournisseur-moteur/fournisseur/100/moteurs")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetFournisseursByMoteur() {
        given()
            .when().get("/fournisseur-moteur/moteur/100/fournisseurs")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetByMoteur() {
        given()
            .when().get("/fournisseur-moteur/moteur/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testSearch() {
        given()
            .when().get("/fournisseur-moteur/search")
            .then()
            .statusCode(200);
    }

    @Test
    void testDeleteNotFound() {
        given()
            .when().delete("/fournisseur-moteur/9999")
            .then()
            .statusCode(404);
    }
}
