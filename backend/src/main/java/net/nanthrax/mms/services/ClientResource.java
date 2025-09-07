package net.nanthrax.mms.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.mms.persistence.ClientEntity;

import java.util.List;

@Path("/clients")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ClientResource {

    @GET
    public List<ClientEntity> list() {
        return ClientEntity.listAll();
    }

    @POST
    @Transactional
    public ClientEntity create(ClientEntity client) {
        client.persist();
        return client;
    }

    @GET
    @Path("{id}")
    public ClientEntity get(int id) {
        ClientEntity entity = ClientEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le client (" + id + ") n'est pas trouvé", 404);
        }
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(int id) {
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
    public ClientEntity update(int id, ClientEntity client) {
        ClientEntity entity = ClientEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le client (" + id + ") n'est pas trouvé", 404);
        }

        entity.prenom = client.prenom;
        entity.nom = client.nom;
        entity.type = client.type;
        entity.email = client.email;
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

        return entity;
    }

}
