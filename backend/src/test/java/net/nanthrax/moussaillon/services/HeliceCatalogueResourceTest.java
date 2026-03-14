package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class HeliceCatalogueResourceTest {

    @Test
    void testListHelices() {
        given()
            .when().get("/catalogue/helices")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testGetHelice() {
        given()
            .when().get("/catalogue/helices/100")
            .then()
            .statusCode(200)
            .body("modele", is("Vengeance 14x19"))
            .body("marque", is("Mercury"));
    }

    @Test
    void testGetHeliceNotFound() {
        given()
            .when().get("/catalogue/helices/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreateHelice() {
        given()
            .contentType("application/json")
            .body("{\"modele\":\"Test Helice\",\"marque\":\"TestBrand\",\"description\":\"Test\",\"diametre\":12,\"pas\":17,\"pales\":3,\"prixVenteTTC\":200.0}")
            .when().post("/catalogue/helices")
            .then()
            .statusCode(200)
            .body("modele", is("Test Helice"))
            .body("id", notNullValue());
    }

    @Test
    void testUpdateHelice() {
        int id = given()
            .contentType("application/json")
            .body("{\"modele\":\"AvantUpdate\",\"marque\":\"Test\",\"description\":\"Test\"}")
            .when().post("/catalogue/helices")
            .then().statusCode(200).extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"modele\":\"ApresUpdate\",\"marque\":\"Test\",\"description\":\"Updated\"}")
            .when().put("/catalogue/helices/" + id)
            .then()
            .statusCode(200)
            .body("modele", is("ApresUpdate"));
    }

    @Test
    void testSearchHelices() {
        given()
            .queryParam("modele", "vengeance")
            .when().get("/catalogue/helices/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testDeleteHelice() {
        int id = given()
            .contentType("application/json")
            .body("{\"modele\":\"ToDelete\",\"marque\":\"Test\",\"description\":\"Test\"}")
            .when().post("/catalogue/helices")
            .then().statusCode(200).extract().path("id");

        given()
            .when().delete("/catalogue/helices/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/catalogue/helices/" + id)
            .then()
            .statusCode(404);
    }
}
