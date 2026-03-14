package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

@QuarkusTest
public class PaymentResourceTest {

    @Test
    void testStripeVenteNotFound() {
        given()
            .contentType("application/json")
            .when().post("/ventes/9999/payment-link/stripe")
            .then()
            .statusCode(404);
    }

    @Test
    void testPayplugVenteNotFound() {
        given()
            .contentType("application/json")
            .when().post("/ventes/9999/payment-link/payplug")
            .then()
            .statusCode(404);
    }

    @Test
    void testStripeWithTestKey() {
        // With test-key, the Stripe SDK will fail (invalid API key)
        // This exercises: vente lookup, key validation, Stripe request building, error handling
        given()
            .contentType("application/json")
            .when().post("/ventes/100/payment-link/stripe")
            .then()
            .statusCode(500);
    }

    @Test
    void testPayplugWithTestKey() {
        // With test-key, the PayPlug HTTP call will fail (401 or connection error)
        // This exercises: vente lookup, key validation, PayPlug request building, error handling
        given()
            .contentType("application/json")
            .when().post("/ventes/100/payment-link/payplug")
            .then()
            .statusCode(500);
    }
}
