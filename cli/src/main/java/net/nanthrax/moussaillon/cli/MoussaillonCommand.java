package net.nanthrax.moussaillon.cli;

import io.quarkus.picocli.runtime.annotations.TopCommand;
import picocli.CommandLine;

@TopCommand
@CommandLine.Command(
        name = "moussaillon",
        description = "CLI de gestion du chantier naval moussAIllon",
        mixinStandardHelpOptions = true,
        version = "0.9-SNAPSHOT",
        subcommands = {
                ClientCommand.class,
                BateauCommand.class,
                MoteurCommand.class,
                TechnicienCommand.class,
                FournisseurCommand.class,
                VenteCommand.class
        }
)
public class MoussaillonCommand {
}
