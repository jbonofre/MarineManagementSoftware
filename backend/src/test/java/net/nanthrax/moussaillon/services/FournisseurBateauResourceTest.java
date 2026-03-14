package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class FournisseurBateauResourceTest {

    @Test
    void testListAll() {
        given()
            .when().get("/fournisseur-bateau")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetNotFound() {
        given()
            .when().get("/fournisseur-bateau/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreateAndGet() {
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
    void testGetByFournisseur() {
        given()
            .when().get("/fournisseur-bateau/fournisseur/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetByBateau() {
        given()
            .when().get("/fournisseur-bateau/bateau/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testSearch() {
        given()
            .when().get("/fournisseur-bateau/search")
            .then()
            .statusCode(200);
    }

    @Test
    void testDeleteNotFound() {
        given()
            .when().delete("/fournisseur-bateau/9999")
            .then()
            .statusCode(404);
    }
}
