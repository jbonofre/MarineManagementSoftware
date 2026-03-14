package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class VenteResourceTest {

    @Test
    void testListVentes() {
        given()
            .when().get("/ventes")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testGetVente() {
        given()
            .when().get("/ventes/100")
            .then()
            .statusCode(200)
            .body("status", is("PAYEE"));
    }

    @Test
    void testGetVenteNotFound() {
        given()
            .when().get("/ventes/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreateVente() {
        given()
            .contentType("application/json")
            .body("{\"status\":\"EN_ATTENTE\",\"type\":\"COMPTOIR\",\"prixVenteTTC\":100.0,\"montantTTC\":100.0}")
            .when().post("/ventes")
            .then()
            .statusCode(201)
            .body("status", is("EN_ATTENTE"))
            .body("type", is("COMPTOIR"))
            .body("id", notNullValue());
    }

    @Test
    void testUpdateVente() {
        int id = given()
            .contentType("application/json")
            .body("{\"status\":\"EN_ATTENTE\",\"type\":\"DEVIS\",\"prixVenteTTC\":200.0}")
            .when().post("/ventes")
            .then().statusCode(201).extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"status\":\"EN_COURS\",\"type\":\"COMMANDE\",\"prixVenteTTC\":200.0,\"remise\":10.0}")
            .when().put("/ventes/" + id)
            .then()
            .statusCode(200)
            .body("status", is("EN_COURS"))
            .body("type", is("COMMANDE"));
    }

    @Test
    void testSearchVentesByStatus() {
        given()
            .queryParam("status", "PAYEE")
            .when().get("/ventes/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testSearchVentesByType() {
        given()
            .queryParam("type", "COMPTOIR")
            .when().get("/ventes/search")
            .then()
            .statusCode(200);
    }

    @Test
    void testSearchVentesInvalidStatus() {
        given()
            .queryParam("status", "INVALID")
            .when().get("/ventes/search")
            .then()
            .statusCode(400);
    }

    @Test
    void testSearchVentesNoFilter() {
        given()
            .when().get("/ventes/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testDeleteVente() {
        int id = given()
            .contentType("application/json")
            .body("{\"status\":\"EN_ATTENTE\",\"type\":\"DEVIS\",\"prixVenteTTC\":50.0}")
            .when().post("/ventes")
            .then().statusCode(201).extract().path("id");

        given()
            .when().delete("/ventes/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/ventes/" + id)
            .then()
            .statusCode(404);
    }

    @Test
    void testDeleteVenteNotFound() {
        given()
            .when().delete("/ventes/9999")
            .then()
            .statusCode(404);
    }
}
