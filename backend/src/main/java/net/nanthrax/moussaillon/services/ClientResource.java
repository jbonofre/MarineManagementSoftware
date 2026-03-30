package net.nanthrax.moussaillon.services;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.moussaillon.persistence.ClientEntity;
import net.nanthrax.moussaillon.persistence.SocieteEntity;

import java.util.List;

@Path("/clients")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ClientResource {

    @Inject
    Mailer mailer;

    @GET
    public List<ClientEntity> list() {
        List<ClientEntity> clients = ClientEntity.listAll();
        clients.forEach(c -> c.motDePasse = null);
        return clients;
    }

    @GET
    @Path("/search")
    public List<ClientEntity> search(@QueryParam("q") String q) {
        if (q == null || q.trim().isEmpty()) {
            return ClientEntity.listAll();
        }
        String likePattern = "%" + q.toLowerCase() + "%";
        List<ClientEntity> clients = ClientEntity.list("LOWER(nom) LIKE ?1 OR LOWER(prenom) LIKE ?1 OR LOWER(type) LIKE ?1 OR LOWER(email) LIKE ?1 OR LOWER(telephone) LIKE ?1", likePattern);
        clients.forEach(c -> c.motDePasse = null);
        return clients;
    }

    @POST
    @Transactional
    public ClientEntity create(ClientEntity client) {
        if (client.motDePasse != null && !client.motDePasse.isBlank()) {
            client.motDePasse = PasswordUtil.hash(client.motDePasse);
        }
        client.persist();
        client.flush();
        ClientEntity.getEntityManager().detach(client);
        client.motDePasse = null;
        return client;
    }

    @GET
    @Path("{id}")
    public ClientEntity get(long id) {
        ClientEntity entity = ClientEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le client (" + id + ") n'est pas trouvé", 404);
        }
        entity.motDePasse = null;
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(long id) {
        ClientEntity entity = ClientEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le client (" + id + ") n'est pas trouvé", 404);
        }
        entity.delete();
        return Response.status(204).build();
    }

    @PUT
    @Path("{id}")
    @Transactional
    public ClientEntity update(long id, ClientEntity client) {
        ClientEntity entity = ClientEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le client (" + id + ") n'est pas trouvé", 404);
        }

        entity.prenom = client.prenom;
        entity.nom = client.nom;
        entity.type = client.type;
        entity.email = client.email;
        entity.telephone = client.telephone;
        entity.adresse = client.adresse;
        entity.consentement = client.consentement;
        entity.date = client.date;
        entity.evaluation = client.evaluation;
        entity.notes = client.notes;
        entity.remise = client.remise;
        entity.siren = client.siren;
        entity.siret = client.siret;
        entity.tva = client.tva;
        entity.naf = client.naf;
        entity.documents = client.documents != null ? client.documents : new java.util.ArrayList<>();

        entity.flush();
        ClientEntity.getEntityManager().detach(entity);
        entity.motDePasse = null;
        return entity;
    }

    @POST
    @Path("{id}/send-password")
    @Transactional
    public Response sendPassword(@PathParam("id") long id, PasswordRequest request) {
        ClientEntity client = ClientEntity.findById(id);
        if (client == null) {
            throw new WebApplicationException("Le client (" + id + ") n'est pas trouvé", 404);
        }
        if (client.email == null || client.email.isBlank()) {
            throw new WebApplicationException("Le client n'a pas d'adresse email", 400);
        }
        if (request.password == null || request.password.isBlank()) {
            throw new WebApplicationException("Le mot de passe est requis", 400);
        }

        client.motDePasse = PasswordUtil.hash(request.password);

        SocieteEntity societe = SocieteEntity.findById(1L);
        String societeNom = societe != null ? societe.nom : "moussAIllon";

        String subject = "Votre mot de passe - Espace Client " + societeNom;
        String body = "Bonjour " + (client.prenom != null ? client.prenom : client.nom) + ",\n\n"
                + "Votre mot de passe pour accéder à l'Espace Client " + societeNom + " :\n\n"
                + "    " + request.password + "\n\n"
                + "Connectez-vous avec votre email : " + client.email + "\n\n"
                + "Cordialement,\n"
                + societeNom;

        mailer.send(Mail.withText(client.email, subject, body));

        return Response.ok().build();
    }

}
