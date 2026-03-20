package net.nanthrax.moussaillon.cli;

import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;
import picocli.CommandLine;

@CommandLine.Command(
        name = "techniciens",
        description = "Gestion des techniciens",
        mixinStandardHelpOptions = true,
        subcommands = {
                TechnicienCommand.List.class,
                TechnicienCommand.Get.class,
                TechnicienCommand.Search.class,
                TechnicienCommand.Create.class,
                TechnicienCommand.Update.class,
                TechnicienCommand.Delete.class
        }
)
public class TechnicienCommand {

    @CommandLine.Command(name = "list", description = "Lister tous les techniciens")
    static class List implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Option(names = "--json", description = "Afficher en JSON")
        boolean json;

        @Override
        public void run() {
            try {
                String response = api.get("/techniciens");
                if (json) {
                    System.out.println(api.prettyPrint(response));
                } else {
                    System.out.println(api.formatTable(response, "id", "nom", "prenom", "email", "telephone", "couleur"));
                }
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "get", description = "Afficher un technicien par ID")
    static class Get implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Parameters(index = "0", description = "ID du technicien")
        long id;

        @Override
        public void run() {
            try {
                System.out.println(api.prettyPrint(api.get("/techniciens/" + id)));
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "search", description = "Rechercher des techniciens")
    static class Search implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Parameters(index = "0", description = "Terme de recherche")
        String query;

        @CommandLine.Option(names = "--json", description = "Afficher en JSON")
        boolean json;

        @Override
        public void run() {
            try {
                String response = api.get("/techniciens/search?q=" + api.encodeQuery(query));
                if (json) {
                    System.out.println(api.prettyPrint(response));
                } else {
                    System.out.println(api.formatTable(response, "id", "nom", "prenom", "email", "telephone", "couleur"));
                }
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "create", description = "Créer un technicien")
    static class Create implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Option(names = "--nom", required = true, description = "Nom")
        String nom;

        @CommandLine.Option(names = "--prenom", required = true, description = "Prénom")
        String prenom;

        @CommandLine.Option(names = "--email", description = "Email")
        String email;

        @CommandLine.Option(names = "--telephone", description = "Téléphone")
        String telephone;

        @CommandLine.Option(names = "--couleur", description = "Couleur (pour le planning)")
        String couleur;

        @Override
        public void run() {
            try {
                JsonObjectBuilder builder = Json.createObjectBuilder()
                        .add("nom", nom)
                        .add("prenom", prenom);
                if (email != null) builder.add("email", email);
                if (telephone != null) builder.add("telephone", telephone);
                if (couleur != null) builder.add("couleur", couleur);
                String response = api.post("/techniciens", builder.build().toString());
                System.out.println("Technicien créé :");
                System.out.println(api.prettyPrint(response));
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "update", description = "Mettre à jour un technicien")
    static class Update implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Parameters(index = "0", description = "ID du technicien")
        long id;

        @CommandLine.Option(names = "--nom", description = "Nom")
        String nom;

        @CommandLine.Option(names = "--prenom", description = "Prénom")
        String prenom;

        @CommandLine.Option(names = "--email", description = "Email")
        String email;

        @CommandLine.Option(names = "--telephone", description = "Téléphone")
        String telephone;

        @CommandLine.Option(names = "--couleur", description = "Couleur")
        String couleur;

        @Override
        public void run() {
            try {
                JsonObjectBuilder builder = Json.createObjectBuilder();
                if (nom != null) builder.add("nom", nom);
                if (prenom != null) builder.add("prenom", prenom);
                if (email != null) builder.add("email", email);
                if (telephone != null) builder.add("telephone", telephone);
                if (couleur != null) builder.add("couleur", couleur);
                String response = api.mergeAndPut("/techniciens/" + id, builder.build().toString());
                System.out.println("Technicien mis à jour :");
                System.out.println(api.prettyPrint(response));
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "delete", description = "Supprimer un technicien")
    static class Delete implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Parameters(index = "0", description = "ID du technicien")
        long id;

        @Override
        public void run() {
            try {
                api.delete("/techniciens/" + id);
                System.out.println("Technicien " + id + " supprimé.");
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }
}
