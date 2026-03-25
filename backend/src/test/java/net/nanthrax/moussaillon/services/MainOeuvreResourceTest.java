package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class MainOeuvreResourceTest {

    @Test
    void testListerMainOeuvres() {
        given()
            .when().get("/main-oeuvres")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testObtenirMainOeuvre() {
        given()
            .when().get("/main-oeuvres/100")
            .then()
            .statusCode(200)
            .body("nom", is("Revision annuelle"));
    }

    @Test
    void testObtenirMainOeuvreNonTrouvee() {
        given()
            .when().get("/main-oeuvres/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreerMainOeuvre() {
        given()
            .contentType("application/json")
            .body("{\"nom\":\"Hivernage\",\"description\":\"Mise en hivernage\",\"prixHT\":100.0,\"tva\":20.0}")
            .when().post("/main-oeuvres")
            .then()
            .statusCode(200)
            .body("nom", is("Hivernage"))
            .body("id", notNullValue());
    }

    @Test
    void testModifierMainOeuvre() {
        int id = given()
            .contentType("application/json")
            .body("{\"nom\":\"AvantUpdate\",\"description\":\"Test\"}")
            .when().post("/main-oeuvres")
            .then().statusCode(200).extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"nom\":\"ApresUpdate\",\"description\":\"Updated\"}")
            .when().put("/main-oeuvres/" + id)
            .then()
            .statusCode(200)
            .body("nom", is("ApresUpdate"));
    }

    @Test
    void testRechercherMainOeuvres() {
        given()
            .queryParam("q", "revision")
            .when().get("/main-oeuvres/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testSupprimerMainOeuvre() {
        int id = given()
            .contentType("application/json")
            .body("{\"nom\":\"ToDelete\",\"description\":\"Test\"}")
            .when().post("/main-oeuvres")
            .then().statusCode(200).extract().path("id");

        given()
            .when().delete("/main-oeuvres/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/main-oeuvres/" + id)
            .then()
            .statusCode(404);
    }
}
