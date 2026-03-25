package net.nanthrax.moussaillon.services;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

@ApplicationScoped
public class DataMigration {

    private static final Logger LOG = Logger.getLogger(DataMigration.class);

    @Inject
    EntityManager em;

    @Transactional
    void onStart(@Observes StartupEvent event) {
        migrateTasksToPrestation();
    }

    private void migrateTasksToPrestation() {
        try {
            // Verifier si l'ancienne table TaskEntity a une colonne vente_id (signe qu'il y a des donnees a migrer)
            Long oldTaskCount = (Long) em.createNativeQuery(
                    "SELECT COUNT(*) FROM TaskEntity WHERE vente_id IS NOT NULL")
                    .getSingleResult();

            if (oldTaskCount == 0) {
                return;
            }

            // Verifier si la migration a deja ete faite
            Long prestationCount = (Long) em.createNativeQuery(
                    "SELECT COUNT(*) FROM PrestationEntity")
                    .getSingleResult();

            if (prestationCount > 0) {
                return;
            }

            LOG.info("Migration des anciennes taches vers les prestations...");

            int migrated = em.createNativeQuery(
                    "INSERT INTO PrestationEntity (nom, status, dateDebut, dateFin, statusDate, description, notes, " +
                    "technicien_id, dureeEstimee, dureeReelle, incidentDate, incidentDetails, vente_id) " +
                    "SELECT nom, status, dateDebut, dateFin, statusDate, description, notes, " +
                    "technicien_id, dureeEstimee, dureeReelle, incidentDate, incidentDetails, vente_id " +
                    "FROM TaskEntity WHERE vente_id IS NOT NULL")
                    .executeUpdate();

            LOG.infof("Migration terminee : %d taches migrees vers les prestations.", migrated);
        } catch (Exception e) {
            LOG.warn("Migration des taches non necessaire ou deja effectuee: " + e.getMessage());
        }
    }
}
