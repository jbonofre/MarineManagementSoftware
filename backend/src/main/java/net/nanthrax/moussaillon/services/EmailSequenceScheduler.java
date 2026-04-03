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
import net.nanthrax.moussaillon.persistence.ClientEntity;
import net.nanthrax.moussaillon.persistence.EmailSequenceEtapeEntity;
import net.nanthrax.moussaillon.persistence.EmailSequenceHistoriqueEntity;
import net.nanthrax.moussaillon.persistence.SocieteEntity;

@ApplicationScoped
public class EmailSequenceScheduler {

    @Inject
    Mailer mailer;

    @Scheduled(cron = "0 5 8 * * ?")
    @Transactional
    public void envoyerSequences() {
        LocalDate today = LocalDate.now();

        List<EmailSequenceEtapeEntity> etapes = EmailSequenceEtapeEntity.listActives();
        if (etapes.isEmpty()) {
            return;
        }

        List<ClientEntity> clients = ClientEntity.list("dateCreation is not null and email is not null");

        SocieteEntity societe = SocieteEntity.findById(1L);
        String societeNom = societe != null ? societe.nom : "moussAIllon";

        for (ClientEntity client : clients) {
            if (client.email == null || client.email.isBlank()) {
                continue;
            }

            LocalDate dateCreation = client.dateCreation.toLocalDateTime().toLocalDate();

            for (EmailSequenceEtapeEntity etape : etapes) {
                long joursSinceCreation = ChronoUnit.DAYS.between(dateCreation, today);

                if (joursSinceCreation >= etape.delaiJours
                        && !EmailSequenceHistoriqueEntity.dejaSent(client.id, etape.id)) {
                    envoyerEtape(client, etape, societeNom);
                }
            }
        }
    }

    private void envoyerEtape(ClientEntity client, EmailSequenceEtapeEntity etape, String societeNom) {
        String clientName = client.prenom != null && !client.prenom.isBlank() ? client.prenom : client.nom;

        String subject = applyVariables(etape.sujet, clientName, societeNom, client);
        String body = applyVariables(etape.contenu, clientName, societeNom, client);

        mailer.send(Mail.withHtml(client.email, subject, body));

        EmailSequenceHistoriqueEntity historique = new EmailSequenceHistoriqueEntity();
        historique.client = client;
        historique.etape = etape;
        historique.destinataire = client.email;
        historique.sujet = subject;
        historique.contenu = body;
        historique.dateEnvoi = new Timestamp(System.currentTimeMillis());
        historique.persist();
    }

    private String applyVariables(String text, String clientName, String societeNom, ClientEntity client) {
        return text
                .replace("{client}", clientName)
                .replace("{societe}", societeNom)
                .replace("{email}", client.email != null ? client.email : "")
                .replace("{telephone}", client.telephone != null ? client.telephone : "");
    }

}
