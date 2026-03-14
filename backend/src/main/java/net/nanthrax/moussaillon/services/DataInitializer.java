package net.nanthrax.moussaillon.services;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
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
            admin.password = "admin";
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
    }

}
