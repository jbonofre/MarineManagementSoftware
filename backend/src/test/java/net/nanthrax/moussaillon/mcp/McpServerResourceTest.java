package net.nanthrax.moussaillon.mcp;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class McpServerResourceTest {

    @Test
    void testInitialiser() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"1\",\"method\":\"initialize\",\"params\":{}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("jsonrpc", is("2.0"))
            .body("id", is("1"))
            .body("result.protocolVersion", is("2024-11-05"))
            .body("result.serverInfo.name", is("moussaillon-quarkus-mcp"));
    }

    @Test
    void testNotificationInitialisee() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"2\",\"method\":\"notifications/initialized\",\"params\":{}}")
            .when().post("/mcp")
            .then()
            .statusCode(204);
    }

    @Test
    void testListeOutils() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"3\",\"method\":\"tools/list\",\"params\":{}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("result.tools.size()", is(2))
            .body("result.tools[0].name", is("moussaillon_list_api_resources"))
            .body("result.tools[1].name", is("moussaillon_call_api_resource"));
    }

    @Test
    void testAppelOutilListerRessources() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"4\",\"method\":\"tools/call\",\"params\":{\"name\":\"moussaillon_list_api_resources\",\"arguments\":{}}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("result.content[0].type", is("text"))
            .body("result.content[0].text", containsString("/clients"));
    }

    @Test
    void testAppelOutilApiRessourceGet() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"5\",\"method\":\"tools/call\",\"params\":{\"name\":\"moussaillon_call_api_resource\",\"arguments\":{\"method\":\"GET\",\"path\":\"/clients\"}}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("result.structuredContent.status", is(200))
            .body("result.structuredContent.method", is("GET"))
            .body("result.structuredContent.path", is("/clients"))
            .body("result.isError", is(false));
    }

    @Test
    void testAppelOutilApiRessourceGetAvecRequete() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"6\",\"method\":\"tools/call\",\"params\":{\"name\":\"moussaillon_call_api_resource\",\"arguments\":{\"method\":\"GET\",\"path\":\"/clients/search\",\"query\":{\"q\":\"dupont\"}}}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("result.structuredContent.status", is(200))
            .body("result.isError", is(false));
    }

    @Test
    void testAppelOutilApiRessourcePost() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"7\",\"method\":\"tools/call\",\"params\":{\"name\":\"moussaillon_call_api_resource\",\"arguments\":{\"method\":\"POST\",\"path\":\"/services\",\"body\":{\"nom\":\"MCP Test Service\",\"description\":\"Created via MCP\",\"prixHT\":50.0,\"tva\":20.0,\"montantTVA\":10.0,\"prixTTC\":60.0}}}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("result.structuredContent.status", is(200))
            .body("result.isError", is(false));
    }

    @Test
    void testAppelOutilApiRessourceNonTrouvee() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"8\",\"method\":\"tools/call\",\"params\":{\"name\":\"moussaillon_call_api_resource\",\"arguments\":{\"method\":\"GET\",\"path\":\"/clients/9999\"}}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("result.structuredContent.status", is(404))
            .body("result.isError", is(true));
    }

    @Test
    void testAppelOutilInconnu() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"9\",\"method\":\"tools/call\",\"params\":{\"name\":\"unknown_tool\",\"arguments\":{}}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("error.code", is(-32602))
            .body("error.message", containsString("Unknown tool"));
    }

    @Test
    void testAppelOutilApiCheminInterdit() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"10\",\"method\":\"tools/call\",\"params\":{\"name\":\"moussaillon_call_api_resource\",\"arguments\":{\"method\":\"GET\",\"path\":\"/admin/secret\"}}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("error.code", is(-32602))
            .body("error.message", containsString("not allowed"));
    }

    @Test
    void testAppelOutilApiMethodeNonSupportee() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"11\",\"method\":\"tools/call\",\"params\":{\"name\":\"moussaillon_call_api_resource\",\"arguments\":{\"method\":\"PATCH\",\"path\":\"/clients\"}}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("error.code", is(-32602))
            .body("error.message", containsString("Unsupported method"));
    }

    @Test
    void testAppelOutilApiMethodeManquante() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"12\",\"method\":\"tools/call\",\"params\":{\"name\":\"moussaillon_call_api_resource\",\"arguments\":{\"path\":\"/clients\"}}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("error.code", is(-32602))
            .body("error.message", containsString("method"));
    }

    @Test
    void testAppelOutilApiCheminManquant() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"13\",\"method\":\"tools/call\",\"params\":{\"name\":\"moussaillon_call_api_resource\",\"arguments\":{\"method\":\"GET\"}}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("error.code", is(-32602))
            .body("error.message", containsString("path"));
    }

    @Test
    void testAppelOutilApiCheminSansSlash() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"14\",\"method\":\"tools/call\",\"params\":{\"name\":\"moussaillon_call_api_resource\",\"arguments\":{\"method\":\"GET\",\"path\":\"clients\"}}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("error.code", is(-32602))
            .body("error.message", containsString("must start with"));
    }

    @Test
    void testMethodeJsonRpcInconnue() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"15\",\"method\":\"unknown/method\",\"params\":{}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("error.code", is(-32601))
            .body("error.message", containsString("Method not found"));
    }

    @Test
    void testMethodeJsonRpcManquante() {
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"16\"}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("error.code", is(-32600));
    }

    @Test
    void testAppelOutilApiRessourcePut() {
        // Creer un service d'abord
        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"17\",\"method\":\"tools/call\",\"params\":{\"name\":\"moussaillon_call_api_resource\",\"arguments\":{\"method\":\"PUT\",\"path\":\"/societe\",\"body\":{\"nom\":\"MCP Updated\",\"siren\":\"123456789\",\"adresse\":\"MCP Address\"}}}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("result.structuredContent.status", is(200));

        // Restaurer
        given()
            .contentType("application/json")
            .body("{\"nom\":\"MS Plaisance\",\"siren\":\"123456789\",\"adresse\":\"10 quai du Port\"}")
            .when().put("/societe")
            .then().statusCode(200);
    }

    @Test
    void testAppelOutilApiRessourceDelete() {
        // Creer un element a supprimer
        int id = given()
            .contentType("application/json")
            .body("{\"nom\":\"MCP Delete Test\",\"description\":\"Test\",\"prixHT\":10.0,\"tva\":20.0,\"montantTVA\":2.0,\"prixTTC\":12.0}")
            .when().post("/services")
            .then().statusCode(200).extract().path("id");

        given()
            .contentType("application/json")
            .body("{\"jsonrpc\":\"2.0\",\"id\":\"18\",\"method\":\"tools/call\",\"params\":{\"name\":\"moussaillon_call_api_resource\",\"arguments\":{\"method\":\"DELETE\",\"path\":\"/services/" + id + "\"}}}")
            .when().post("/mcp")
            .then()
            .statusCode(200)
            .body("result.structuredContent.status", is(204));
    }
}
