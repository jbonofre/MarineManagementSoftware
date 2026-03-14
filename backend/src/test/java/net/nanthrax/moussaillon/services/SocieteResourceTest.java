package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class SocieteResourceTest {

    @Test
    void testGetSociete() {
        given()
            .when().get("/societe")
            .then()
            .statusCode(200)
            .body("nom", is("MS Plaisance"))
            .body("siren", is("123456789"));
    }

    @Test
    void testUpdateSociete() {
        given()
            .contentType("application/json")
            .body("{\"nom\":\"MS Plaisance Updated\",\"siren\":\"123456789\",\"adresse\":\"20 quai du Port\",\"email\":\"new@msplaisance.com\"}")
            .when().put("/societe")
            .then()
            .statusCode(200)
            .body("nom", is("MS Plaisance Updated"))
            .body("adresse", is("20 quai du Port"));

        // Restore original
        given()
            .contentType("application/json")
            .body("{\"nom\":\"MS Plaisance\",\"siren\":\"123456789\",\"adresse\":\"10 quai du Port\"}")
            .when().put("/societe")
            .then()
            .statusCode(200);
    }
}
