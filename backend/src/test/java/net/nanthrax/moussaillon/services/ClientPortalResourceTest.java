package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class ClientPortalResourceTest {

    @Test
    void testLoginSuccess() {
        given()
            .contentType("application/json")
            .body("{\"email\":\"jean.dupont@test.com\",\"password\":\"client123\"}")
            .when().post("/portal/login")
            .then()
            .statusCode(200)
            .body("nom", is("Dupont"));
    }

    @Test
    void testLoginMissingEmail() {
        given()
            .contentType("application/json")
            .body("{\"password\":\"test\"}")
            .when().post("/portal/login")
            .then()
            .statusCode(400);
    }

    @Test
    void testLoginWrongEmail() {
        given()
            .contentType("application/json")
            .body("{\"email\":\"unknown@test.com\",\"password\":\"test\"}")
            .when().post("/portal/login")
            .then()
            .statusCode(401);
    }

    @Test
    void testLoginWrongPassword() {
        given()
            .contentType("application/json")
            .body("{\"email\":\"jean.dupont@test.com\",\"password\":\"wrong\"}")
            .when().post("/portal/login")
            .then()
            .statusCode(401);
    }

    @Test
    void testGetClient() {
        given()
            .when().get("/portal/clients/100")
            .then()
            .statusCode(200)
            .body("nom", is("Dupont"));
    }

    @Test
    void testGetClientNotFound() {
        given()
            .when().get("/portal/clients/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testGetClientBateaux() {
        given()
            .when().get("/portal/clients/100/bateaux")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetClientMoteurs() {
        given()
            .when().get("/portal/clients/100/moteurs")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetClientRemorques() {
        given()
            .when().get("/portal/clients/100/remorques")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetClientVentes() {
        given()
            .when().get("/portal/clients/100/ventes")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetClientAnnonces() {
        given()
            .when().get("/portal/clients/100/annonces")
            .then()
            .statusCode(200);
    }
}
