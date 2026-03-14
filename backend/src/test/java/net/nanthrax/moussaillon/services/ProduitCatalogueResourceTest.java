package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class ProduitCatalogueResourceTest {

    @Test
    void testListerProduits() {
        given()
            .when().get("/catalogue/produits")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testObtenirProduit() {
        given()
            .when().get("/catalogue/produits/100")
            .then()
            .statusCode(200)
            .body("nom", is("Huile moteur 4T"))
            .body("marque", is("Motul"));
    }

    @Test
    void testObtenirProduitNonTrouve() {
        given()
            .when().get("/catalogue/produits/9999")
            .then()
            .statusCode(404);
    }

    @Test
    void testCreerProduit() {
        given()
            .contentType("application/json")
            .body("{\"nom\":\"Antifouling\",\"marque\":\"International\",\"categorie\":\"Peinture\",\"stock\":10,\"prixVenteTTC\":45.0}")
            .when().post("/catalogue/produits")
            .then()
            .statusCode(200)
            .body("nom", is("Antifouling"))
            .body("id", notNullValue());
    }

    @Test
    void testModifierProduit() {
        int id = given()
            .contentType("application/json")
            .body("{\"nom\":\"AvantUpdate\",\"marque\":\"Test\",\"categorie\":\"Test\"}")
            .when().post("/catalogue/produits")
            .then().statusCode(200).extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"nom\":\"ApresUpdate\",\"marque\":\"Test\",\"categorie\":\"Test\"}")
            .when().put("/catalogue/produits/" + id)
            .then()
            .statusCode(200)
            .body("nom", is("ApresUpdate"));
    }

    @Test
    void testRechercherProduits() {
        given()
            .queryParam("q", "huile")
            .when().get("/catalogue/produits/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    void testListerFournisseurs() {
        given()
            .when().get("/catalogue/produits/fournisseurs")
            .then()
            .statusCode(200);
    }

    @Test
    void testSupprimerProduit() {
        int id = given()
            .contentType("application/json")
            .body("{\"nom\":\"ToDelete\",\"marque\":\"Test\",\"categorie\":\"Test\"}")
            .when().post("/catalogue/produits")
            .then().statusCode(200).extract().path("id");

        given()
            .when().delete("/catalogue/produits/" + id)
            .then()
            .statusCode(204);

        given()
            .when().get("/catalogue/produits/" + id)
            .then()
            .statusCode(404);
    }
}
