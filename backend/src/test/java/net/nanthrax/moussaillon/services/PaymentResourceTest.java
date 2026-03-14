package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class PaymentResourceTest {

    @Test
    void testStripeVenteNonTrouvee() {
        given()
            .contentType("application/json")
            .when().post("/ventes/9999/payment-link/stripe")
            .then()
            .statusCode(404);
    }

    @Test
    void testPayplugVenteNonTrouvee() {
        given()
            .contentType("application/json")
            .when().post("/ventes/9999/payment-link/payplug")
            .then()
            .statusCode(404);
    }

    @Test
    void testStripeAvecClefTest() {
        // Avec la clef de test, le SDK Stripe echouera (clef API invalide)
        // Cela teste: recherche de vente, validation de clef, construction requete Stripe, gestion erreurs
        given()
            .contentType("application/json")
            .when().post("/ventes/100/payment-link/stripe")
            .then()
            .statusCode(500);
    }

    @Test
    void testPayplugAvecClefTest() {
        // Avec la clef de test, l'appel HTTP PayPlug echouera (401 ou erreur de connexion)
        // Cela teste: recherche de vente, validation de clef, construction requete PayPlug, gestion erreurs
        given()
            .contentType("application/json")
            .when().post("/ventes/100/payment-link/payplug")
            .then()
            .statusCode(500);
    }
}
