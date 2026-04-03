package net.nanthrax.moussaillon.services;

import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.moussaillon.persistence.EmailSequenceEtapeEntity;
import net.nanthrax.moussaillon.persistence.EmailSequenceEtapeEntity.Cible;
import net.nanthrax.moussaillon.persistence.EmailSequenceHistoriqueEntity;

@Path("/email-sequences")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EmailSequenceResource {

    @GET
    public List<EmailSequenceEtapeEntity> list(@QueryParam("cible") String cible) {
        if (cible != null && !cible.isBlank()) {
            return EmailSequenceEtapeEntity.listByCible(Cible.valueOf(cible));
        }
        return EmailSequenceEtapeEntity.listAllOrdered();
    }

    @GET
    @Path("{id}")
    public EmailSequenceEtapeEntity get(@PathParam("id") long id) {
        EmailSequenceEtapeEntity entity = EmailSequenceEtapeEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("L'étape de séquence (" + id + ") n'est pas trouvée", 404);
        }
        return entity;
    }

    @POST
    @Transactional
    public EmailSequenceEtapeEntity create(EmailSequenceEtapeEntity etape) {
        etape.persist();
        return etape;
    }

    @PUT
    @Path("{id}")
    @Transactional
    public EmailSequenceEtapeEntity update(@PathParam("id") long id, EmailSequenceEtapeEntity etape) {
        EmailSequenceEtapeEntity entity = EmailSequenceEtapeEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("L'étape de séquence (" + id + ") n'est pas trouvée", 404);
        }
        entity.cible = etape.cible;
        entity.ordre = etape.ordre;
        entity.delaiJours = etape.delaiJours;
        entity.sujet = etape.sujet;
        entity.contenu = etape.contenu;
        entity.description = etape.description;
        entity.actif = etape.actif;
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(@PathParam("id") long id) {
        EmailSequenceEtapeEntity entity = EmailSequenceEtapeEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("L'étape de séquence (" + id + ") n'est pas trouvée", 404);
        }
        EmailSequenceHistoriqueEntity.delete("etape.id", id);
        entity.delete();
        return Response.status(204).build();
    }

    @POST
    @Path("/init")
    @Transactional
    public Response init() {
        if (EmailSequenceEtapeEntity.count() > 0) {
            // Ajouter les séquences manquantes pour les nouvelles cibles (migration)
            for (Cible cible : Cible.values()) {
                if (EmailSequenceEtapeEntity.listByCible(cible).isEmpty()) {
                    initCible(cible);
                }
            }
            return Response.ok().build();
        }

        for (Cible cible : Cible.values()) {
            initCible(cible);
        }

        return Response.status(Response.Status.CREATED).build();
    }

    private void initCible(Cible cible) {
        String label = switch (cible) {
            case CLIENT -> "client";
            case BATEAU -> "bateau";
            case MOTEUR -> "moteur";
            case REMORQUE -> "remorque";
        };

        String variablesEquipement = cible == Cible.CLIENT ? "" : " L'identifiant de l'équipement est disponible via {equipement}.";

        EmailSequenceEtapeEntity bienvenue = new EmailSequenceEtapeEntity();
        bienvenue.cible = cible;
        bienvenue.ordre = 1;
        bienvenue.delaiJours = 0;
        bienvenue.actif = true;

        if (cible == Cible.CLIENT) {
            bienvenue.sujet = "Bienvenue chez {societe} !";
            bienvenue.contenu = "<p>Bonjour {client},</p>"
                    + "<p>Nous sommes ravis de vous accueillir parmi nos clients !</p>"
                    + "<p>N'hésitez pas à nous contacter pour toute question.</p>"
                    + "<p>Cordialement,<br/>{societe}</p>";
            bienvenue.description = "Email de bienvenue envoyé à la création du client";
        } else {
            bienvenue.sujet = "Votre nouveau " + label + " - {societe}";
            bienvenue.contenu = "<p>Bonjour {client},</p>"
                    + "<p>Votre " + label + " {equipement} a bien été enregistré chez {societe}.</p>"
                    + "<p>N'hésitez pas à nous contacter pour toute question.</p>"
                    + "<p>Cordialement,<br/>{societe}</p>";
            bienvenue.description = "Confirmation d'enregistrement du " + label;
        }
        bienvenue.persist();

        EmailSequenceEtapeEntity suivi = new EmailSequenceEtapeEntity();
        suivi.cible = cible;
        suivi.ordre = 2;
        suivi.delaiJours = 7;
        suivi.actif = true;

        if (cible == Cible.CLIENT) {
            suivi.sujet = "Découvrez {societe}";
            suivi.contenu = "<p>Bonjour {client},</p>"
                    + "<p>Nous souhaitons vous présenter nos services et notre expertise.</p>"
                    + "<p>Chez {societe}, nous mettons tout en œuvre pour vous offrir un service de qualité.</p>"
                    + "<p>N'hésitez pas à nous rendre visite ou à nous contacter.</p>"
                    + "<p>Cordialement,<br/>{societe}</p>";
            suivi.description = "Présentation de l'entreprise envoyée après quelques jours";
        } else {
            suivi.sujet = "Tout va bien avec votre " + label + " ? - {societe}";
            suivi.contenu = "<p>Bonjour {client},</p>"
                    + "<p>Nous espérons que tout se passe bien avec votre " + label + " {equipement}.</p>"
                    + "<p>Avez-vous des questions ou des besoins particuliers ? Nous sommes à votre écoute.</p>"
                    + "<p>Cordialement,<br/>{societe}</p>";
            suivi.description = "Email de suivi après enregistrement du " + label;
        }
        suivi.persist();
    }

}
