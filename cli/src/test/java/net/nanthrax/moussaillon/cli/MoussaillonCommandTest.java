package net.nanthrax.moussaillon.cli;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;
import picocli.CommandLine;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@QuarkusTestResource(WireMockResource.class)
class MoussaillonCommandTest {

    @Inject
    CommandLine.IFactory factory;

    @Test
    void testHelp() {
        CommandLine cmd = new CommandLine(MoussaillonCommand.class, factory);
        int exitCode = cmd.execute("--help");
        assertEquals(0, exitCode);
    }

    @Test
    void testVersion() {
        CommandLine cmd = new CommandLine(MoussaillonCommand.class, factory);
        int exitCode = cmd.execute("--version");
        assertEquals(0, exitCode);
    }

    @Test
    void testSousCommandesDisponibles() {
        CommandLine cmd = new CommandLine(MoussaillonCommand.class, factory);
        assertTrue(cmd.getSubcommands().containsKey("clients"));
        assertTrue(cmd.getSubcommands().containsKey("bateaux"));
        assertTrue(cmd.getSubcommands().containsKey("moteurs"));
        assertTrue(cmd.getSubcommands().containsKey("techniciens"));
        assertTrue(cmd.getSubcommands().containsKey("fournisseurs"));
        assertTrue(cmd.getSubcommands().containsKey("ventes"));
        assertEquals(6, cmd.getSubcommands().size());
    }
}
