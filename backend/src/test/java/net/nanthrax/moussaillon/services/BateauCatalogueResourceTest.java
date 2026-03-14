package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class BateauCatalogueResourceTest {

    @Test
    void testListBateaux() {
        given()
            .when().get("/catalogue/bateaux")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testGetBateau() {
        given()
            .when().get("/catalogue/bateaux/100")
            .then()
            .statusCode(200)
            .body("modele", is("Quicksilver 505"))
            .body("marque", is("Quicksilver"))
            .body("type", is("Open"));
    }

    @Test
    void testGetBateauNotFound() {
        given()
            .when().get("/catalogue/bateaux/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreateBateau() {
        given()
            .contentType("application/json")
            .body("{\"modele\":\"Test 300\",\"marque\":\"TestBrand\",\"type\":\"Cabin\",\"description\":\"Test boat\",\"annee\":2025,\"stock\":5,\"prixVenteTTC\":30000.0}")
            .when().post("/catalogue/bateaux")
            .then()
            .statusCode(201)
            .body("modele", is("Test 300"))
            .body("marque", is("TestBrand"))
            .body("id", notNullValue());
    }

    @Test
    void testUpdateBateau() {
        // Create a dedicated entity for update test
        int id = given()
            .contentType("application/json")
            .body("{\"modele\":\"AvantUpdate\",\"marque\":\"TestBrand\",\"type\":\"Open\"}")
            .when().post("/catalogue/bateaux")
            .then()
            .statusCode(201)
            .extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"modele\":\"ApresUpdate\",\"marque\":\"TestBrand\",\"type\":\"Open\",\"description\":\"Updated\",\"annee\":2025}")
            .when().put("/catalogue/bateaux/" + id)
            .then()
            .statusCode(200)
            .body("modele", is("ApresUpdate"));
    }

    @Test
    void testSearchBateaux() {
        given()
            .queryParam("q", "quicksilver")
            .when().get("/catalogue/bateaux/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testSearchBateauxNoQuery() {
        given()
            .when().get("/catalogue/bateaux/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testDeleteBateau() {
        // Create one to delete
        int id = given()
            .contentType("application/json")
            .body("{\"modele\":\"ToDelete\",\"marque\":\"TestBrand\",\"type\":\"Open\"}")
            .when().post("/catalogue/bateaux")
            .then()
            .statusCode(201)
            .extract().path("id");

        given()
            .when().delete("/catalogue/bateaux/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/catalogue/bateaux/" + id)
            .then()
            .statusCode(404);
    }
}
