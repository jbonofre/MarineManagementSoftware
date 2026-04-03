package net.nanthrax.moussaillon.services;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
import net.nanthrax.moussaillon.persistence.ReferenceValeurEntity;
import net.nanthrax.moussaillon.persistence.SocieteEntity;
import net.nanthrax.moussaillon.persistence.UserEntity;

@ApplicationScoped
public class DataInitializer {

    @Transactional
    void onStart(@Observes StartupEvent event) {
        if (UserEntity.count() == 0) {
            UserEntity admin = new UserEntity();
            admin.name = "admin";
            admin.roles = "admin";
            admin.password = PasswordUtil.hash("admin");
            admin.email = "contact@msplaisance.com";
            admin.persist();
        }
        if (SocieteEntity.count() == 0) {
            SocieteEntity societe = new SocieteEntity();
            societe.nom = "A changer";
            societe.siren = "A changer";
            societe.capital = 0;
            societe.adresse = "A changer";
            societe.persist();
        }
        if (ReferenceValeurEntity.count() == 0) {
            String[][] categories = {
                {"CATEGORIE_PRODUIT", "Pièces Moteur"},
                {"CATEGORIE_PRODUIT", "Pièces Remorque"},
                {"CATEGORIE_PRODUIT", "Electronique"},
                {"CATEGORIE_PRODUIT", "Sécurité"},
                {"CATEGORIE_PRODUIT", "Equipement & Accessoires"},
                {"CATEGORIE_PRODUIT", "Loisirs"},
                {"TYPE_BATEAU", "Bateau à Moteur"},
                {"TYPE_BATEAU", "Voilier"},
                {"TYPE_BATEAU", "Catamaran"},
                {"TYPE_BATEAU", "Péniche"},
                {"TYPE_BATEAU", "Pêche"},
                {"TYPE_BATEAU", "Annexe"},
                {"TYPE_BATEAU", "Autre"},
                {"TYPE_MOTEUR", "Hors-bord"},
                {"TYPE_MOTEUR", "In-bord"},
                {"TYPE_MOTEUR", "Electrique"},
                {"TYPE_MOTEUR", "Diesel"},
            };
            int ordre = 10;
            String currentType = "";
            for (String[] entry : categories) {
                if (!entry[0].equals(currentType)) {
                    currentType = entry[0];
                    ordre = 10;
                }
                ReferenceValeurEntity ref = new ReferenceValeurEntity();
                ref.type = entry[0];
                ref.valeur = entry[1];
                ref.ordre = ordre;
                ref.persist();
                ordre += 10;
            }
        }
    }

}
