package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class ServiceResourceTest {

    @Test
    void testListServices() {
        given()
            .when().get("/services")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testGetService() {
        given()
            .when().get("/services/100")
            .then()
            .statusCode(200)
            .body("nom", is("Revision annuelle"));
    }

    @Test
    void testGetServiceNotFound() {
        given()
            .when().get("/services/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreateService() {
        given()
            .contentType("application/json")
            .body("{\"nom\":\"Hivernage\",\"description\":\"Mise en hivernage\",\"prixHT\":100.0,\"tva\":20.0}")
            .when().post("/services")
            .then()
            .statusCode(200)
            .body("nom", is("Hivernage"))
            .body("id", notNullValue());
    }

    @Test
    void testUpdateService() {
        int id = given()
            .contentType("application/json")
            .body("{\"nom\":\"AvantUpdate\",\"description\":\"Test\"}")
            .when().post("/services")
            .then().statusCode(200).extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"nom\":\"ApresUpdate\",\"description\":\"Updated\"}")
            .when().put("/services/" + id)
            .then()
            .statusCode(200)
            .body("nom", is("ApresUpdate"));
    }

    @Test
    void testSearchServices() {
        given()
            .queryParam("q", "revision")
            .when().get("/services/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testDeleteService() {
        int id = given()
            .contentType("application/json")
            .body("{\"nom\":\"ToDelete\",\"description\":\"Test\"}")
            .when().post("/services")
            .then().statusCode(200).extract().path("id");

        given()
            .when().delete("/services/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/services/" + id)
            .then()
            .statusCode(404);
    }
}
