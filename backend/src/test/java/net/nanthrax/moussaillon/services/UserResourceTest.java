package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class UserResourceTest {

    @Test
    void testListUsers() {
        given()
            .when().get("/users")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(2));
    }

    @Test
    void testGetUser() {
        given()
            .when().get("/users/admin")
            .then()
            .statusCode(200)
            .body("name", is("admin"))
            .body("email", is("admin@test.com"))
            .body("roles", is("ADMIN"));
    }

    @Test
    void testGetUserNotFound() {
        given()
            .when().get("/users/inexistant")
            .then()
            .statusCode(404);
    }

    @Test
    void testAuthenticate() {
        given()
            .contentType("application/json")
            .body("{\"name\":\"admin\",\"password\":\"admin123\"}")
            .when().post("/users/authenticate")
            .then()
            .statusCode(200)
            .body("name", is("admin"));
    }

    @Test
    void testAuthenticateInvalidPassword() {
        given()
            .contentType("application/json")
            .body("{\"name\":\"admin\",\"password\":\"wrong\"}")
            .when().post("/users/authenticate")
            .then()
            .statusCode(401);
    }

    @Test
    void testSearchUsers() {
        given()
            .queryParam("q", "admin")
            .when().get("/users/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testCreateAndDeleteUser() {
        // Create
        given()
            .contentType("application/json")
            .body("{\"name\":\"testuser\",\"password\":\"pass123\",\"email\":\"test@test.com\",\"roles\":\"USER\"}")
            .when().post("/users")
            .then()
            .statusCode(201)
            .body("name", is("testuser"));

        // Delete
        given()
            .when().delete("/users/testuser")
            .then()
            .statusCode(204);
    }

    @Test
    void testChangePassword() {
        given()
            .contentType("application/json")
            .body("{\"currentPassword\":\"tech123\",\"newPassword\":\"newpass\"}")
            .when().post("/users/technicien1/change-password")
            .then()
            .statusCode(204);

        // Verify new password works
        given()
            .contentType("application/json")
            .body("{\"name\":\"technicien1\",\"password\":\"newpass\"}")
            .when().post("/users/authenticate")
            .then()
            .statusCode(200);
    }

    @Test
    void testChangePasswordWrongCurrent() {
        given()
            .contentType("application/json")
            .body("{\"currentPassword\":\"wrong\",\"newPassword\":\"newpass\"}")
            .when().post("/users/admin/change-password")
            .then()
            .statusCode(401);
    }
}
