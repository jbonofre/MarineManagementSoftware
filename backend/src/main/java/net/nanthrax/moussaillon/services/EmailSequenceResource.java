package net.nanthrax.moussaillon.services;

import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.moussaillon.persistence.EmailSequenceEtapeEntity;
import net.nanthrax.moussaillon.persistence.EmailSequenceHistoriqueEntity;

@Path("/email-sequences")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EmailSequenceResource {

    @GET
    public List<EmailSequenceEtapeEntity> list() {
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
            return Response.ok().build();
        }

        EmailSequenceEtapeEntity bienvenue = new EmailSequenceEtapeEntity();
        bienvenue.ordre = 1;
        bienvenue.delaiJours = 0;
        bienvenue.sujet = "Bienvenue chez {societe} !";
        bienvenue.contenu = "<p>Bonjour {client},</p>"
                + "<p>Nous sommes ravis de vous accueillir parmi nos clients !</p>"
                + "<p>N'hésitez pas à nous contacter pour toute question.</p>"
                + "<p>Cordialement,<br/>{societe}</p>";
        bienvenue.description = "Email de bienvenue envoyé à la création du client";
        bienvenue.actif = true;
        bienvenue.persist();

        EmailSequenceEtapeEntity presentation = new EmailSequenceEtapeEntity();
        presentation.ordre = 2;
        presentation.delaiJours = 3;
        presentation.sujet = "Découvrez {societe}";
        presentation.contenu = "<p>Bonjour {client},</p>"
                + "<p>Nous souhaitons vous présenter nos services et notre expertise.</p>"
                + "<p>Chez {societe}, nous mettons tout en œuvre pour vous offrir un service de qualité.</p>"
                + "<p>N'hésitez pas à nous rendre visite ou à nous contacter.</p>"
                + "<p>Cordialement,<br/>{societe}</p>";
        presentation.description = "Présentation de l'entreprise envoyée après quelques jours";
        presentation.actif = true;
        presentation.persist();

        EmailSequenceEtapeEntity suivi = new EmailSequenceEtapeEntity();
        suivi.ordre = 3;
        suivi.delaiJours = 7;
        suivi.sujet = "Comment pouvons-nous vous aider ? - {societe}";
        suivi.contenu = "<p>Bonjour {client},</p>"
                + "<p>Nous espérons que vous êtes satisfait(e) de nos services.</p>"
                + "<p>Avez-vous des questions ou des besoins particuliers ? Nous sommes à votre écoute.</p>"
                + "<p>Cordialement,<br/>{societe}</p>";
        suivi.description = "Email de suivi pour maintenir le contact";
        suivi.actif = true;
        suivi.persist();

        return Response.status(Response.Status.CREATED).build();
    }

}
