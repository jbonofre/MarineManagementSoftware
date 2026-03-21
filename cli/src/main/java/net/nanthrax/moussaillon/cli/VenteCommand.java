package net.nanthrax.moussaillon.cli;

import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;
import picocli.CommandLine;

@CommandLine.Command(
        name = "ventes",
        description = "Gestion des ventes",
        mixinStandardHelpOptions = true,
        subcommands = {
                VenteCommand.List.class,
                VenteCommand.Get.class,
                VenteCommand.Search.class,
                VenteCommand.Create.class,
                VenteCommand.Update.class,
                VenteCommand.Delete.class
        }
)
public class VenteCommand {

    @CommandLine.Command(name = "list", description = "Lister toutes les ventes")
    static class List implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Option(names = "--json", description = "Afficher en JSON")
        boolean json;

        @Override
        public void run() {
            try {
                String response = api.get("/ventes");
                if (json) {
                    System.out.println(api.prettyPrint(response));
                } else {
                    System.out.println(api.formatTable(response, "id", "type", "status", "date", "montantTTC"));
                }
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "get", description = "Afficher une vente par ID")
    static class Get implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Parameters(index = "0", description = "ID de la vente")
        long id;

        @Override
        public void run() {
            try {
                System.out.println(api.prettyPrint(api.get("/ventes/" + id)));
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "search", description = "Rechercher des ventes")
    static class Search implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Option(names = "--status", description = "Filtrer par statut")
        String status;

        @CommandLine.Option(names = "--type", description = "Filtrer par type")
        String type;

        @CommandLine.Option(names = "--client-id", description = "Filtrer par ID client")
        Long clientId;

        @CommandLine.Option(names = "--json", description = "Afficher en JSON")
        boolean json;

        @Override
        public void run() {
            try {
                StringBuilder path = new StringBuilder("/ventes/search");
                String separator = "?";
                if (status != null) {
                    path.append(separator).append("status=").append(api.encodeQuery(status));
                    separator = "&";
                }
                if (type != null) {
                    path.append(separator).append("type=").append(api.encodeQuery(type));
                    separator = "&";
                }
                if (clientId != null) {
                    path.append(separator).append("clientId=").append(clientId);
                }
                String response = api.get(path.toString());
                if (json) {
                    System.out.println(api.prettyPrint(response));
                } else {
                    System.out.println(api.formatTable(response, "id", "type", "status", "date", "montantTTC"));
                }
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "create", description = "Créer une vente")
    static class Create implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Option(names = "--type", required = true, description = "Type de vente")
        String type;

        @CommandLine.Option(names = "--client-id", description = "ID du client")
        Long clientId;

        @CommandLine.Option(names = "--date", description = "Date de la vente")
        String date;

        @CommandLine.Option(names = "--notes", description = "Notes")
        String notes;

        @Override
        public void run() {
            try {
                JsonObjectBuilder builder = Json.createObjectBuilder()
                        .add("type", type);
                if (clientId != null) {
                    builder.add("client", Json.createObjectBuilder().add("id", clientId));
                }
                if (date != null) builder.add("date", date);
                if (notes != null) builder.add("notes", notes);
                String response = api.post("/ventes", builder.build().toString());
                System.out.println("Vente créée :");
                System.out.println(api.prettyPrint(response));
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "update", description = "Mettre à jour une vente")
    static class Update implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Parameters(index = "0", description = "ID de la vente")
        long id;

        @CommandLine.Option(names = "--type", description = "Type de vente")
        String type;

        @CommandLine.Option(names = "--status", description = "Statut")
        String status;

        @CommandLine.Option(names = "--date", description = "Date de la vente")
        String date;

        @CommandLine.Option(names = "--notes", description = "Notes")
        String notes;

        @CommandLine.Option(names = "--client-id", description = "ID du client")
        Long clientId;

        @Override
        public void run() {
            try {
                JsonObjectBuilder builder = Json.createObjectBuilder();
                if (type != null) builder.add("type", type);
                if (status != null) builder.add("status", status);
                if (date != null) builder.add("date", date);
                if (notes != null) builder.add("notes", notes);
                if (clientId != null) builder.add("client", Json.createObjectBuilder().add("id", clientId));
                String response = api.mergeAndPut("/ventes/" + id, builder.build().toString());
                System.out.println("Vente mise à jour :");
                System.out.println(api.prettyPrint(response));
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "delete", description = "Supprimer une vente")
    static class Delete implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Parameters(index = "0", description = "ID de la vente")
        long id;

        @Override
        public void run() {
            try {
                api.delete("/ventes/" + id);
                System.out.println("Vente " + id + " supprimée.");
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }
}
