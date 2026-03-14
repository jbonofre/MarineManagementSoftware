package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class TransactionResourceTest {

    @Test
    void testListTransactions() {
        given()
            .when().get("/transactions")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testGetTransaction() {
        given()
            .when().get("/transactions/100")
            .then()
            .statusCode(200)
            .body("montantHT", is(1500));
    }

    @Test
    void testGetTransactionNotFound() {
        given()
            .when().get("/transactions/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreateTransaction() {
        given()
            .contentType("application/json")
            .body("{\"status\":\"EN_ATTENTE\",\"montantHT\":2000,\"remise\":0}")
            .when().post("/transactions")
            .then()
            .statusCode(201)
            .body("status", is("EN_ATTENTE"))
            .body("id", notNullValue());
    }

    @Test
    void testUpdateTransaction() {
        int id = given()
            .contentType("application/json")
            .body("{\"status\":\"EN_ATTENTE\",\"montantHT\":1000,\"remise\":0}")
            .when().post("/transactions")
            .then().statusCode(201).extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"status\":\"VALIDEE\",\"montantHT\":1000,\"remise\":0}")
            .when().put("/transactions/" + id)
            .then()
            .statusCode(200)
            .body("status", is("VALIDEE"));
    }

    @Test
    void testSearchTransactionsByStatus() {
        given()
            .queryParam("status", "EN_ATTENTE")
            .when().get("/transactions/search")
            .then()
            .statusCode(200);
    }

    @Test
    void testSearchTransactionsNoFilter() {
        given()
            .when().get("/transactions/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testDeleteTransaction() {
        int id = given()
            .contentType("application/json")
            .body("{\"status\":\"EN_ATTENTE\",\"montantHT\":500,\"remise\":0}")
            .when().post("/transactions")
            .then().statusCode(201).extract().path("id");

        given()
            .when().delete("/transactions/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/transactions/" + id)
            .then()
            .statusCode(404);
    }
}
