package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class BateauClientResourceTest {

    @Test
    void testListerBateaux() {
        given()
            .when().get("/bateaux")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirBateauNonTrouve() {
        given()
            .when().get("/bateaux/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreerBateau() {
        given()
            .contentType("application/json")
            .body("{\"name\":\"Mon Bateau\",\"immatriculation\":\"AB-123\",\"numeroSerie\":\"SN001\"}")
            .when().post("/bateaux")
            .then()
            .statusCode(201)
            .body("name", is("Mon Bateau"))
            .body("id", notNullValue());
    }

    @Test
    void testModifierBateau() {
        int id = given()
            .contentType("application/json")
            .body("{\"name\":\"AvantUpdate\",\"immatriculation\":\"XX-001\"}")
            .when().post("/bateaux")
            .then().statusCode(201).extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"name\":\"ApresUpdate\",\"immatriculation\":\"XX-002\"}")
            .when().put("/bateaux/" + id)
            .then()
            .statusCode(200)
            .body("name", is("ApresUpdate"));
    }

    @Test
    void testRechercherBateaux() {
        // Creer un bateau pour garantir des resultats de recherche
        given()
            .contentType("application/json")
            .body("{\"name\":\"SearchTest\",\"immatriculation\":\"SR-001\"}")
            .when().post("/bateaux")
            .then().statusCode(201);

        given()
            .queryParam("q", "searchtest")
            .when().get("/bateaux/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testSupprimerBateau() {
        int id = given()
            .contentType("application/json")
            .body("{\"name\":\"ToDelete\",\"immatriculation\":\"DEL-001\"}")
            .when().post("/bateaux")
            .then().statusCode(201).extract().path("id");

        given()
            .when().delete("/bateaux/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/bateaux/" + id)
            .then()
            .statusCode(404);
    }
}
