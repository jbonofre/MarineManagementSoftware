package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class ClientResourceTest {

    @Test
    void testListerClients() {
        given()
            .when().get("/clients")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(2));
    }

    @Test
    void testObtenirClient() {
        given()
            .when().get("/clients/100")
            .then()
            .statusCode(200)
            .body("nom", is("Dupont"))
            .body("prenom", is("Jean"))
            .body("type", is("Particulier"))
            .body("email", is("jean.dupont@test.com"));
    }

    @Test
    void testObtenirClientNonTrouve() {
        given()
            .when().get("/clients/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreerClient() {
        given()
            .contentType("application/json")
            .body("{\"nom\":\"Nouveau\",\"prenom\":\"Client\",\"type\":\"Particulier\",\"email\":\"nouveau@test.com\"}")
            .when().post("/clients")
            .then()
            .statusCode(200)
            .body("nom", is("Nouveau"))
            .body("prenom", is("Client"))
            .body("id", notNullValue());
    }

    @Test
    void testModifierClient() {
        // Creer une entite dediee pour le test de modification
        int id = given()
            .contentType("application/json")
            .body("{\"nom\":\"AvantUpdate\",\"prenom\":\"Test\",\"type\":\"Particulier\"}")
            .when().post("/clients")
            .then()
            .statusCode(200)
            .extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"nom\":\"ApresUpdate\",\"prenom\":\"Test\",\"type\":\"Particulier\",\"email\":\"update@test.com\"}")
            .when().put("/clients/" + id)
            .then()
            .statusCode(200)
            .body("nom", is("ApresUpdate"));
    }

    @Test
    void testRechercherClients() {
        given()
            .queryParam("q", "dupont")
            .when().get("/clients/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testRechercherClientsSansRequete() {
        given()
            .when().get("/clients/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(2));
    }

    @Test
    void testSupprimerClient() {
        // Creer un client a supprimer
        int id = given()
            .contentType("application/json")
            .body("{\"nom\":\"ASupprimer\",\"prenom\":\"Test\",\"type\":\"Particulier\"}")
            .when().post("/clients")
            .then()
            .statusCode(200)
            .extract().path("id");

        given()
            .when().delete("/clients/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/clients/" + id)
            .then()
            .statusCode(404);
    }
}
