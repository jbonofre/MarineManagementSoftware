package net.nanthrax.moussaillon.cli;

import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;
import picocli.CommandLine;

@CommandLine.Command(
        name = "fournisseurs",
        description = "Gestion des fournisseurs",
        mixinStandardHelpOptions = true,
        subcommands = {
                FournisseurCommand.List.class,
                FournisseurCommand.Get.class,
                FournisseurCommand.Search.class,
                FournisseurCommand.Create.class,
                FournisseurCommand.Update.class,
                FournisseurCommand.Delete.class
        }
)
public class FournisseurCommand {

    @CommandLine.Command(name = "list", description = "Lister tous les fournisseurs")
    static class List implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Option(names = "--json", description = "Afficher en JSON")
        boolean json;

        @Override
        public void run() {
            try {
                String response = api.get("/catalogue/fournisseurs");
                if (json) {
                    System.out.println(api.prettyPrint(response));
                } else {
                    System.out.println(api.formatTable(response, "id", "nom", "email", "telephone", "adresse"));
                }
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "get", description = "Afficher un fournisseur par ID")
    static class Get implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Parameters(index = "0", description = "ID du fournisseur")
        long id;

        @Override
        public void run() {
            try {
                System.out.println(api.prettyPrint(api.get("/catalogue/fournisseurs/" + id)));
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "search", description = "Rechercher des fournisseurs")
    static class Search implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Parameters(index = "0", description = "Terme de recherche")
        String query;

        @CommandLine.Option(names = "--json", description = "Afficher en JSON")
        boolean json;

        @Override
        public void run() {
            try {
                String response = api.get("/catalogue/fournisseurs/search?q=" + api.encodeQuery(query));
                if (json) {
                    System.out.println(api.prettyPrint(response));
                } else {
                    System.out.println(api.formatTable(response, "id", "nom", "email", "telephone", "adresse"));
                }
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "create", description = "Créer un fournisseur")
    static class Create implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Option(names = "--nom", required = true, description = "Nom")
        String nom;

        @CommandLine.Option(names = "--email", description = "Email")
        String email;

        @CommandLine.Option(names = "--telephone", description = "Téléphone")
        String telephone;

        @CommandLine.Option(names = "--adresse", description = "Adresse")
        String adresse;

        @CommandLine.Option(names = "--siren", description = "SIREN")
        String siren;

        @CommandLine.Option(names = "--siret", description = "SIRET")
        String siret;

        @Override
        public void run() {
            try {
                JsonObjectBuilder builder = Json.createObjectBuilder()
                        .add("nom", nom);
                if (email != null) builder.add("email", email);
                if (telephone != null) builder.add("telephone", telephone);
                if (adresse != null) builder.add("adresse", adresse);
                if (siren != null) builder.add("siren", siren);
                if (siret != null) builder.add("siret", siret);
                String response = api.post("/catalogue/fournisseurs", builder.build().toString());
                System.out.println("Fournisseur créé :");
                System.out.println(api.prettyPrint(response));
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "update", description = "Mettre à jour un fournisseur")
    static class Update implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Parameters(index = "0", description = "ID du fournisseur")
        long id;

        @CommandLine.Option(names = "--nom", description = "Nom")
        String nom;

        @CommandLine.Option(names = "--email", description = "Email")
        String email;

        @CommandLine.Option(names = "--telephone", description = "Téléphone")
        String telephone;

        @CommandLine.Option(names = "--adresse", description = "Adresse")
        String adresse;

        @CommandLine.Option(names = "--siren", description = "SIREN")
        String siren;

        @CommandLine.Option(names = "--siret", description = "SIRET")
        String siret;

        @Override
        public void run() {
            try {
                JsonObjectBuilder builder = Json.createObjectBuilder();
                if (nom != null) builder.add("nom", nom);
                if (email != null) builder.add("email", email);
                if (telephone != null) builder.add("telephone", telephone);
                if (adresse != null) builder.add("adresse", adresse);
                if (siren != null) builder.add("siren", siren);
                if (siret != null) builder.add("siret", siret);
                String response = api.mergeAndPut("/catalogue/fournisseurs/" + id, builder.build().toString());
                System.out.println("Fournisseur mis à jour :");
                System.out.println(api.prettyPrint(response));
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }

    @CommandLine.Command(name = "delete", description = "Supprimer un fournisseur")
    static class Delete implements Runnable {
        @Inject ApiClient api;

        @CommandLine.Parameters(index = "0", description = "ID du fournisseur")
        long id;

        @Override
        public void run() {
            try {
                api.delete("/catalogue/fournisseurs/" + id);
                System.out.println("Fournisseur " + id + " supprimé.");
            } catch (Exception e) {
                System.err.println("Erreur : " + e.getMessage());
            }
        }
    }
}
