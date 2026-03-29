package net.nanthrax.moussaillon.services;

import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.moussaillon.persistence.EmailTemplateEntity;

@Path("/email-templates")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EmailTemplateResource {

    @GET
    public List<EmailTemplateEntity> list() {
        return EmailTemplateEntity.listAll();
    }

    @GET
    @Path("{id}")
    public EmailTemplateEntity get(@PathParam("id") long id) {
        EmailTemplateEntity entity = EmailTemplateEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le modèle d'email (" + id + ") n'est pas trouvé", 404);
        }
        return entity;
    }

    @PUT
    @Path("{id}")
    @Transactional
    public EmailTemplateEntity update(@PathParam("id") long id, EmailTemplateEntity template) {
        EmailTemplateEntity entity = EmailTemplateEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le modèle d'email (" + id + ") n'est pas trouvé", 404);
        }
        entity.sujet = template.sujet;
        entity.contenu = template.contenu;
        entity.description = template.description;
        return entity;
    }

    @POST
    @Path("/init")
    @Transactional
    public Response init() {
        if (EmailTemplateEntity.count() > 0) {
            // Ajouter le template FACTURE s'il n'existe pas encore (migration)
            if (EmailTemplateEntity.findByType(EmailTemplateEntity.Type.FACTURE) == null) {
                EmailTemplateEntity facture = new EmailTemplateEntity();
                facture.type = EmailTemplateEntity.Type.FACTURE;
                facture.sujet = "Votre {typeVente} #{reference} - {societe}";
                facture.contenu = "Bonjour {client},\n\n"
                        + "Veuillez trouver les informations de votre {typeVente} #{reference}.\n\n"
                        + "Date             : {date}\n"
                        + "Type             : {typeVente}\n"
                        + "Statut           : {statut}\n"
                        + "Prix vente TTC   : {prixVenteTTC}\n"
                        + "Mode de paiement : {modePaiement}\n\n"
                        + "Lignes :\n{lignes}\n\n"
                        + "N'hésitez pas à nous contacter pour toute question.\n\n"
                        + "Cordialement,\n{societe}";
                facture.description = "Variables disponibles : {client}, {typeVente}, {reference}, {date}, {statut}, {prixVenteTTC}, {modePaiement}, {lignes}, {societe}";
                facture.persist();
            }
            return Response.ok().build();
        }

        EmailTemplateEntity rappel = new EmailTemplateEntity();
        rappel.type = EmailTemplateEntity.Type.RAPPEL;
        rappel.sujet = "Rappel {numeroRappel} - Votre {typeVente} - {societe}";
        rappel.contenu = "Bonjour {client},\n\n"
                + "Ceci est un rappel concernant votre {typeVente} (référence #{reference}).\n\n"
                + "Date prévue : {datePrevue}\n"
                + "Montant TTC : {montantTTC} EUR\n\n"
                + "N'hésitez pas à nous contacter pour toute question.\n\n"
                + "Cordialement,\n{societe}";
        rappel.description = "Variables disponibles : {client}, {typeVente}, {reference}, {datePrevue}, {montantTTC}, {societe}, {numeroRappel}";
        rappel.persist();

        EmailTemplateEntity incident = new EmailTemplateEntity();
        incident.type = EmailTemplateEntity.Type.INCIDENT;
        incident.sujet = "Incident sur votre intervention - {societe}";
        incident.contenu = "Bonjour {client},\n\n"
                + "Nous vous informons qu'un incident a été signalé sur l'intervention \"{intervention}\".\n\n"
                + "{details}"
                + "{dateIncident}"
                + "Notre équipe met tout en œuvre pour résoudre la situation dans les meilleurs délais.\n\n"
                + "Cordialement,\n{societe}";
        incident.description = "Variables disponibles : {client}, {intervention}, {details}, {dateIncident}, {societe}";
        incident.persist();

        EmailTemplateEntity facture = new EmailTemplateEntity();
        facture.type = EmailTemplateEntity.Type.FACTURE;
        facture.sujet = "Votre {typeVente} #{reference} - {societe}";
        facture.contenu = "Bonjour {client},\n\n"
                + "Veuillez trouver les informations de votre {typeVente} #{reference}.\n\n"
                + "Date             : {date}\n"
                + "Type             : {typeVente}\n"
                + "Statut           : {statut}\n"
                + "Prix vente TTC   : {prixVenteTTC}\n"
                + "Mode de paiement : {modePaiement}\n\n"
                + "Lignes :\n{lignes}\n\n"
                + "N'hésitez pas à nous contacter pour toute question.\n\n"
                + "Cordialement,\n{societe}";
        facture.description = "Variables disponibles : {client}, {typeVente}, {reference}, {date}, {statut}, {prixVenteTTC}, {modePaiement}, {lignes}, {societe}";
        facture.persist();

        return Response.status(Response.Status.CREATED).build();
    }

}
