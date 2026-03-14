package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class MoteurClientResourceTest {

    @Test
    void testListMoteurs() {
        given()
            .when().get("/moteurs")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetMoteurNotFound() {
        given()
            .when().get("/moteurs/9999")
            .then()
            .statusCode(204);
    }

    @Test
    void testCreateMoteur() {
        given()
            .contentType("application/json")
            .body("{\"numeroSerie\":\"MOT-001\",\"numeroClef\":\"KEY-001\"}")
            .when().post("/moteurs")
            .then()
            .statusCode(200)
            .body("numeroSerie", is("MOT-001"))
            .body("id", notNullValue());
    }

    @Test
    void testUpdateMoteur() {
        int id = given()
            .contentType("application/json")
            .body("{\"numeroSerie\":\"MOT-UPD\"}")
            .when().post("/moteurs")
            .then().statusCode(200).extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"numeroSerie\":\"MOT-UPDATED\"}")
            .when().put("/moteurs/" + id)
            .then()
            .statusCode(200)
            .body("numeroSerie", is("MOT-UPDATED"));
    }

    @Test
    void testSearchMoteurs() {
        given()
            .queryParam("q", "mot")
            .when().get("/moteurs/search")
            .then()
            .statusCode(200);
    }

    @Test
    void testDeleteMoteur() {
        int id = given()
            .contentType("application/json")
            .body("{\"numeroSerie\":\"MOT-DEL\"}")
            .when().post("/moteurs")
            .then().statusCode(200).extract().path("id");

        given()
            .when().delete("/moteurs/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/moteurs/" + id)
            .then()
            .statusCode(204);
    }
}
