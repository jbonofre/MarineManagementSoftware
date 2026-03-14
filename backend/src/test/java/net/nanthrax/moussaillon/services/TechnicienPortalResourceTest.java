package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class TechnicienPortalResourceTest {

    @Test
    void testLoginSuccess() {
        given()
            .contentType("application/json")
            .body("{\"email\":\"pierre.leclerc@test.com\",\"motDePasse\":\"tech456\"}")
            .when().post("/technicien-portal/login")
            .then()
            .statusCode(200)
            .body("nom", is("Leclerc"));
    }

    @Test
    void testLoginMissingEmail() {
        given()
            .contentType("application/json")
            .body("{\"motDePasse\":\"test\"}")
            .when().post("/technicien-portal/login")
            .then()
            .statusCode(400);
    }

    @Test
    void testLoginWrongEmail() {
        given()
            .contentType("application/json")
            .body("{\"email\":\"unknown@test.com\",\"motDePasse\":\"test\"}")
            .when().post("/technicien-portal/login")
            .then()
            .statusCode(401);
    }

    @Test
    void testLoginWrongPassword() {
        given()
            .contentType("application/json")
            .body("{\"email\":\"pierre.leclerc@test.com\",\"motDePasse\":\"wrong\"}")
            .when().post("/technicien-portal/login")
            .then()
            .statusCode(401);
    }

    @Test
    void testGetTechnicienTasks() {
        given()
            .when().get("/technicien-portal/techniciens/100/taches")
            .then()
            .statusCode(200);
    }

    @Test
    void testGetTechnicienTasksNotFound() {
        given()
            .when().get("/technicien-portal/techniciens/9999/taches")
            .then()
            .statusCode(404);
    }

    @Test
    void testUpdateTask() {
        given()
            .contentType("application/json")
            .body("{\"status\":\"EN_COURS\",\"dureeReelle\":1.5,\"notes\":\"En cours de traitement\"}")
            .when().put("/technicien-portal/taches/100")
            .then()
            .statusCode(200)
            .body("taskStatus", is("EN_COURS"));
    }

    @Test
    void testUpdateTaskNotFound() {
        given()
            .contentType("application/json")
            .body("{\"status\":\"EN_COURS\",\"dureeReelle\":1.0}")
            .when().put("/technicien-portal/taches/9999")
            .then()
            .statusCode(404);
    }
}
