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
    void testStripeRefuseQuandPasFacturePrete() {
        // La vente 100 a le statut FACTURE_PAYEE, le paiement doit etre refuse
        given()
            .contentType("application/json")
            .when().post("/ventes/100/payment-link/stripe")
            .then()
            .statusCode(400);
    }

    @Test
    void testPayplugRefuseQuandPasFacturePrete() {
        // La vente 100 a le statut FACTURE_PAYEE, le paiement doit etre refuse
        given()
            .contentType("application/json")
            .when().post("/ventes/100/payment-link/payplug")
            .then()
            .statusCode(400);
    }
}
