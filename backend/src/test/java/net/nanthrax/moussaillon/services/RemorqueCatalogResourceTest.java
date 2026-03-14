package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class RemorqueCatalogResourceTest {

    @Test
    void testListRemorques() {
        given()
            .when().get("/catalogue/remorques")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testGetRemorque() {
        given()
            .when().get("/catalogue/remorques/100")
            .then()
            .statusCode(200)
            .body("modele", is("Sun Way 500"))
            .body("marque", is("Sun Way"));
    }

    @Test
    void testGetRemorqueNotFound() {
        given()
            .when().get("/catalogue/remorques/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreateRemorque() {
        given()
            .contentType("application/json")
            .body("{\"modele\":\"Test Remorque\",\"marque\":\"TestBrand\",\"description\":\"Test\",\"ptac\":500,\"stock\":1,\"prixVenteTTC\":1500.0}")
            .when().post("/catalogue/remorques")
            .then()
            .statusCode(200)
            .body("modele", is("Test Remorque"))
            .body("id", notNullValue());
    }

    @Test
    void testUpdateRemorque() {
        int id = given()
            .contentType("application/json")
            .body("{\"modele\":\"AvantUpdate\",\"marque\":\"Test\",\"description\":\"Test\"}")
            .when().post("/catalogue/remorques")
            .then().statusCode(200).extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"modele\":\"ApresUpdate\",\"marque\":\"Test\",\"description\":\"Updated\"}")
            .when().put("/catalogue/remorques/" + id)
            .then()
            .statusCode(200)
            .body("modele", is("ApresUpdate"));
    }

    @Test
    void testSearchRemorques() {
        given()
            .queryParam("modele", "sun")
            .when().get("/catalogue/remorques/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testDeleteRemorque() {
        int id = given()
            .contentType("application/json")
            .body("{\"modele\":\"ToDelete\",\"marque\":\"Test\",\"description\":\"Test\"}")
            .when().post("/catalogue/remorques")
            .then().statusCode(200).extract().path("id");

        given()
            .when().delete("/catalogue/remorques/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/catalogue/remorques/" + id)
            .then()
            .statusCode(404);
    }
}
