package net.nanthrax.moussaillon.services;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import net.nanthrax.moussaillon.persistence.SocieteEntity;
import net.nanthrax.moussaillon.persistence.VenteEntity;

@ApplicationScoped
public class RappelScheduler {

    @Inject
    Mailer mailer;

    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void envoyerRappels() {
        LocalDate today = LocalDate.now();

        List<VenteEntity> ventes = VenteEntity.list(
                "status in (?1, ?2) and date is not null and client is not null",
                VenteEntity.Status.EN_ATTENTE, VenteEntity.Status.EN_COURS);

        for (VenteEntity vente : ventes) {
            if (vente.client == null || vente.client.email == null || vente.client.email.isBlank()) {
                continue;
            }

            LocalDate dateVente = new Timestamp(vente.date.getTime()).toLocalDateTime().toLocalDate();
            long joursRestants = ChronoUnit.DAYS.between(today, dateVente);

            if (!vente.rappel1Envoye && vente.rappel1Jours != null && joursRestants <= vente.rappel1Jours) {
                envoyerRappel(vente, 1, vente.rappel1Jours);
                vente.rappel1Envoye = true;
            }

            if (!vente.rappel2Envoye && vente.rappel2Jours != null && joursRestants <= vente.rappel2Jours) {
                envoyerRappel(vente, 2, vente.rappel2Jours);
                vente.rappel2Envoye = true;
            }

            if (!vente.rappel3Envoye && vente.rappel3Jours != null && joursRestants <= vente.rappel3Jours) {
                envoyerRappel(vente, 3, vente.rappel3Jours);
                vente.rappel3Envoye = true;
            }
        }
    }

    private void envoyerRappel(VenteEntity vente, int numeroRappel, int joursAvant) {
        SocieteEntity societe = SocieteEntity.findById(1L);
        String societeNom = societe != null ? societe.nom : "moussAIllon";
        String clientName = vente.client.prenom != null ? vente.client.prenom : vente.client.nom;

        String typeLabel = switch (vente.type) {
            case DEVIS -> "devis";
            case COMMANDE -> "commande";
            case FACTURE -> "facture";
            case LIVRAISON -> "livraison";
            case COMPTOIR -> "vente comptoir";
        };

        String subject = "Rappel " + numeroRappel + " - Votre " + typeLabel + " - " + societeNom;

        String body = "Bonjour " + clientName + ",\n\n"
                + "Ceci est un rappel concernant votre " + typeLabel
                + " (reference #" + vente.id + ").\n\n"
                + "Date prevue : " + new Timestamp(vente.date.getTime()).toLocalDateTime().toLocalDate() + "\n"
                + "Montant TTC : " + String.format("%.2f", vente.prixVenteTTC) + " EUR\n\n"
                + "N'hesitez pas a nous contacter pour toute question.\n\n"
                + "Cordialement,\n" + societeNom;

        mailer.send(Mail.withText(vente.client.email, subject, body));
    }
}
