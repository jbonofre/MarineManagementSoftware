package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class ClientPortalResourceTest {

    @Test
    void testConnexionReussie() {
        given()
            .contentType("application/json")
            .body("{\"email\":\"jean.dupont@test.com\",\"password\":\"client123\"}")
            .when().post("/portal/login")
            .then()
            .statusCode(200)
            .body("nom", is("Dupont"));
    }

    @Test
    void testConnexionEmailManquant() {
        given()
            .contentType("application/json")
            .body("{\"password\":\"test\"}")
            .when().post("/portal/login")
            .then()
            .statusCode(400);
    }

    @Test
    void testConnexionEmailInconnu() {
        given()
            .contentType("application/json")
            .body("{\"email\":\"unknown@test.com\",\"password\":\"test\"}")
            .when().post("/portal/login")
            .then()
            .statusCode(401);
    }

    @Test
    void testConnexionMotDePasseIncorrect() {
        given()
            .contentType("application/json")
            .body("{\"email\":\"jean.dupont@test.com\",\"password\":\"wrong\"}")
            .when().post("/portal/login")
            .then()
            .statusCode(401);
    }

    @Test
    void testObtenirClient() {
        given()
            .when().get("/portal/clients/100")
            .then()
            .statusCode(200)
            .body("nom", is("Dupont"));
    }

    @Test
    void testObtenirClientNonTrouve() {
        given()
            .when().get("/portal/clients/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testObtenirBateauxClient() {
        given()
            .when().get("/portal/clients/100/bateaux")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirMoteursClient() {
        given()
            .when().get("/portal/clients/100/moteurs")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirRemorquesClient() {
        given()
            .when().get("/portal/clients/100/remorques")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirVentesClient() {
        given()
            .when().get("/portal/clients/100/ventes")
            .then()
            .statusCode(200);
    }

    @Test
    void testObtenirAnnoncesClient() {
        given()
            .when().get("/portal/clients/100/annonces")
            .then()
            .statusCode(200);
    }
}
