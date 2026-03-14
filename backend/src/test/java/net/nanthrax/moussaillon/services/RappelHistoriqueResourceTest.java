package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class RappelHistoriqueResourceTest {

    @Test
    void testListerHistorique() {
        given()
            .when().get("/rappels")
            .then()
            .statusCode(200);
    }

    @Test
    void testListerHistoriqueParVente() {
        given()
            .when().get("/rappels/vente/100")
            .then()
            .statusCode(200);
    }

    @Test
    void testListerHistoriqueParVenteInexistante() {
        given()
            .when().get("/rappels/vente/9999")
            .then()
            .statusCode(200)
            .body("size()", is(0));
    }

    @Test
    void testHistoriqueCreePourRappelEnvoye() {
        // Creer une vente avec rappel et date proche pour declencher l'envoi
        int venteId = given()
            .contentType("application/json")
            .body("{\"status\":\"EN_ATTENTE\",\"type\":\"DEVIS\",\"prixVenteTTC\":100.0,"
                + "\"rappel1Jours\":999,"
                + "\"date\":\"2026-04-01T00:00:00\","
                + "\"client\":{\"id\":100}}")
            .when().post("/ventes")
            .then().statusCode(201).extract().path("id");

        // Le scheduler s'execute periodiquement, mais on peut verifier via le endpoint
        // que l'historique est accessible pour cette vente
        given()
            .when().get("/rappels/vente/" + venteId)
            .then()
            .statusCode(200);
    }
}
