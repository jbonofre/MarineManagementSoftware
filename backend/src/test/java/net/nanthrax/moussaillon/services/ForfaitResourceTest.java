package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class ForfaitResourceTest {

    @Test
    void testListForfaits() {
        given()
            .when().get("/forfaits")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testGetForfait() {
        given()
            .when().get("/forfaits/100")
            .then()
            .statusCode(200)
            .body("nom", is("Pack entretien complet"));
    }

    @Test
    void testGetForfaitNotFound() {
        given()
            .when().get("/forfaits/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreateForfait() {
        given()
            .contentType("application/json")
            .body("{\"nom\":\"Pack hivernage\",\"reference\":\"FORFAIT-002\",\"prixHT\":180.0,\"tva\":20.0}")
            .when().post("/forfaits")
            .then()
            .statusCode(201)
            .body("nom", is("Pack hivernage"))
            .body("id", notNullValue());
    }

    @Test
    void testUpdateForfait() {
        int id = given()
            .contentType("application/json")
            .body("{\"nom\":\"AvantUpdate\",\"reference\":\"REF-UPD\"}")
            .when().post("/forfaits")
            .then().statusCode(201).extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"nom\":\"ApresUpdate\",\"reference\":\"REF-UPD\"}")
            .when().put("/forfaits/" + id)
            .then()
            .statusCode(200)
            .body("nom", is("ApresUpdate"));
    }

    @Test
    void testSearchForfaits() {
        given()
            .queryParam("q", "entretien")
            .when().get("/forfaits/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testDeleteForfait() {
        int id = given()
            .contentType("application/json")
            .body("{\"nom\":\"ToDelete\",\"reference\":\"REF-DEL\"}")
            .when().post("/forfaits")
            .then().statusCode(201).extract().path("id");

        given()
            .when().delete("/forfaits/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/forfaits/" + id)
            .then()
            .statusCode(404);
    }
}
