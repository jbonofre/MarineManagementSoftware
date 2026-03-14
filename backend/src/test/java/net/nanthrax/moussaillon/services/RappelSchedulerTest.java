package net.nanthrax.moussaillon.services;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import net.nanthrax.moussaillon.persistence.ClientEntity;
import net.nanthrax.moussaillon.persistence.VenteEntity;
import org.junit.jupiter.api.Test;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class RappelSchedulerTest {

    @Inject
    RappelScheduler rappelScheduler;

    @Test
    @Transactional
    void testEnvoyerRappelQuandDateAtteinte() {
        ClientEntity client = ClientEntity.findById(100L);

        VenteEntity vente = new VenteEntity();
        vente.status = VenteEntity.Status.EN_ATTENTE;
        vente.type = VenteEntity.Type.DEVIS;
        vente.client = client;
        vente.date = Timestamp.valueOf(LocalDate.now().plusDays(5).atStartOfDay());
        vente.rappel1Jours = 10;
        vente.rappel2Jours = 3;
        vente.prixVenteTTC = 500.0;
        vente.persist();

        rappelScheduler.envoyerRappels();

        VenteEntity updated = VenteEntity.findById(vente.id);
        assertTrue(updated.rappel1Envoye, "Rappel 1 aurait du etre envoye (5 jours restants <= 10 jours)");
        assertFalse(updated.rappel2Envoye, "Rappel 2 ne devrait pas etre envoye (5 jours restants > 3 jours)");
        assertFalse(updated.rappel3Envoye, "Rappel 3 non configure, ne devrait pas etre envoye");
    }

    @Test
    @Transactional
    void testPasDeRappelQuandDateLointaine() {
        ClientEntity client = ClientEntity.findById(100L);

        VenteEntity vente = new VenteEntity();
        vente.status = VenteEntity.Status.EN_ATTENTE;
        vente.type = VenteEntity.Type.COMMANDE;
        vente.client = client;
        vente.date = Timestamp.valueOf(LocalDate.now().plusDays(60).atStartOfDay());
        vente.rappel1Jours = 30;
        vente.rappel2Jours = 7;
        vente.rappel3Jours = 1;
        vente.prixVenteTTC = 1000.0;
        vente.persist();

        rappelScheduler.envoyerRappels();

        VenteEntity updated = VenteEntity.findById(vente.id);
        assertFalse(updated.rappel1Envoye, "Rappel 1 ne devrait pas etre envoye (60 jours restants > 30 jours)");
        assertFalse(updated.rappel2Envoye, "Rappel 2 ne devrait pas etre envoye (60 jours restants > 7 jours)");
        assertFalse(updated.rappel3Envoye, "Rappel 3 ne devrait pas etre envoye (60 jours restants > 1 jour)");
    }

    @Test
    @Transactional
    void testPasDeRappelSansConfiguration() {
        ClientEntity client = ClientEntity.findById(100L);

        VenteEntity vente = new VenteEntity();
        vente.status = VenteEntity.Status.EN_ATTENTE;
        vente.type = VenteEntity.Type.FACTURE;
        vente.client = client;
        vente.date = Timestamp.valueOf(LocalDate.now().plusDays(1).atStartOfDay());
        vente.prixVenteTTC = 200.0;
        vente.persist();

        rappelScheduler.envoyerRappels();

        VenteEntity updated = VenteEntity.findById(vente.id);
        assertFalse(updated.rappel1Envoye, "Aucun rappel configure, rien ne devrait etre envoye");
        assertFalse(updated.rappel2Envoye);
        assertFalse(updated.rappel3Envoye);
    }

    @Test
    @Transactional
    void testPasDeDoublonRappelDejaEnvoye() {
        ClientEntity client = ClientEntity.findById(100L);

        VenteEntity vente = new VenteEntity();
        vente.status = VenteEntity.Status.EN_COURS;
        vente.type = VenteEntity.Type.COMMANDE;
        vente.client = client;
        vente.date = Timestamp.valueOf(LocalDate.now().plusDays(2).atStartOfDay());
        vente.rappel1Jours = 10;
        vente.rappel1Envoye = true;
        vente.prixVenteTTC = 300.0;
        vente.persist();

        rappelScheduler.envoyerRappels();

        VenteEntity updated = VenteEntity.findById(vente.id);
        assertTrue(updated.rappel1Envoye, "Le drapeau doit rester vrai");
    }

    @Test
    @Transactional
    void testPasDeRappelPourVentePayee() {
        ClientEntity client = ClientEntity.findById(100L);

        VenteEntity vente = new VenteEntity();
        vente.status = VenteEntity.Status.PAYEE;
        vente.type = VenteEntity.Type.FACTURE;
        vente.client = client;
        vente.date = Timestamp.valueOf(LocalDate.now().plusDays(1).atStartOfDay());
        vente.rappel1Jours = 10;
        vente.prixVenteTTC = 400.0;
        vente.persist();

        rappelScheduler.envoyerRappels();

        VenteEntity updated = VenteEntity.findById(vente.id);
        assertFalse(updated.rappel1Envoye, "Pas de rappel pour une vente payee");
    }

    @Test
    @Transactional
    void testPasDeRappelSansEmailClient() {
        ClientEntity clientSansEmail = new ClientEntity();
        clientSansEmail.nom = "SansEmail";
        clientSansEmail.type = "Particulier";
        clientSansEmail.persist();

        VenteEntity vente = new VenteEntity();
        vente.status = VenteEntity.Status.EN_ATTENTE;
        vente.type = VenteEntity.Type.DEVIS;
        vente.client = clientSansEmail;
        vente.date = Timestamp.valueOf(LocalDate.now().plusDays(1).atStartOfDay());
        vente.rappel1Jours = 10;
        vente.prixVenteTTC = 100.0;
        vente.persist();

        rappelScheduler.envoyerRappels();

        VenteEntity updated = VenteEntity.findById(vente.id);
        assertFalse(updated.rappel1Envoye, "Pas de rappel sans email client");
    }

    @Test
    @Transactional
    void testTousRappelsEnvoyesQuandDatePassee() {
        ClientEntity client = ClientEntity.findById(100L);

        VenteEntity vente = new VenteEntity();
        vente.status = VenteEntity.Status.EN_ATTENTE;
        vente.type = VenteEntity.Type.DEVIS;
        vente.client = client;
        vente.date = Timestamp.valueOf(LocalDate.now().minusDays(1).atStartOfDay());
        vente.rappel1Jours = 30;
        vente.rappel2Jours = 7;
        vente.rappel3Jours = 1;
        vente.prixVenteTTC = 600.0;
        vente.persist();

        rappelScheduler.envoyerRappels();

        VenteEntity updated = VenteEntity.findById(vente.id);
        assertTrue(updated.rappel1Envoye, "Tous les rappels devraient etre envoyes quand la date est passee");
        assertTrue(updated.rappel2Envoye);
        assertTrue(updated.rappel3Envoye);
    }
}
