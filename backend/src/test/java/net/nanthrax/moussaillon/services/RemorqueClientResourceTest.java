package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class RemorqueClientResourceTest {

    @Test
    void testListerRemorques() {
        given()
            .when().get("/remorques")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirRemorqueNonTrouvee() {
        given()
            .when().get("/remorques/9999")
            .then()
            .statusCode(204);
    }

    @Test
    void testCreerRemorque() {
        given()
            .contentType("application/json")
            .body("{\"immatriculation\":\"REM-001\"}")
            .when().post("/remorques")
            .then()
            .statusCode(200)
            .body("immatriculation", is("REM-001"))
            .body("id", notNullValue());
    }

    @Test
    void testModifierRemorque() {
        int id = given()
            .contentType("application/json")
            .body("{\"immatriculation\":\"REM-UPD\"}")
            .when().post("/remorques")
            .then().statusCode(200).extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"immatriculation\":\"REM-UPDATED\"}")
            .when().put("/remorques/" + id)
            .then()
            .statusCode(200)
            .body("immatriculation", is("REM-UPDATED"));
    }

    @Test
    void testRechercherRemorques() {
        given()
            .queryParam("q", "rem")
            .when().get("/remorques/search")
            .then()
            .statusCode(200);
    }

    @Test
    void testSupprimerRemorque() {
        int id = given()
            .contentType("application/json")
            .body("{\"immatriculation\":\"REM-DEL\"}")
            .when().post("/remorques")
            .then().statusCode(200).extract().path("id");

        given()
            .when().delete("/remorques/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/remorques/" + id)
            .then()
            .statusCode(204);
    }
}
