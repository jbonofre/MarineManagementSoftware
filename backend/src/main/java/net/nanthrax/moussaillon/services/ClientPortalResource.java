package net.nanthrax.moussaillon.services;

import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.moussaillon.persistence.BateauClientEntity;
import net.nanthrax.moussaillon.persistence.ClientEntity;
import net.nanthrax.moussaillon.persistence.MoteurClientEntity;
import net.nanthrax.moussaillon.persistence.RemorqueClientEntity;
import net.nanthrax.moussaillon.persistence.VenteEntity;

@Path("/portal")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ClientPortalResource {

    public static class LoginRequest {
        public String email;
        public String password;
    }

    @POST
    @Path("/login")
    public ClientEntity login(LoginRequest request) {
        if (request == null || request.email == null || request.email.isBlank()) {
            throw new WebApplicationException("L'email est requis", Response.Status.BAD_REQUEST);
        }
        List<ClientEntity> clients = ClientEntity.list("LOWER(email) = ?1", request.email.toLowerCase().trim());
        if (clients.isEmpty()) {
            throw new WebApplicationException("Aucun compte client trouve avec cet email", Response.Status.UNAUTHORIZED);
        }
        return clients.get(0);
    }

    @GET
    @Path("/clients/{id}")
    public ClientEntity getClient(@PathParam("id") long id) {
        ClientEntity entity = ClientEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Client non trouve", Response.Status.NOT_FOUND);
        }
        return entity;
    }

    @GET
    @Path("/clients/{id}/bateaux")
    public List<BateauClientEntity> getClientBateaux(@PathParam("id") long id) {
        return BateauClientEntity.list("SELECT b FROM BateauClientEntity b JOIN b.proprietaires p WHERE p.id = ?1", id);
    }

    @GET
    @Path("/clients/{id}/moteurs")
    public List<MoteurClientEntity> getClientMoteurs(@PathParam("id") long id) {
        return MoteurClientEntity.list("proprietaire.id = ?1", id);
    }

    @GET
    @Path("/clients/{id}/remorques")
    public List<RemorqueClientEntity> getClientRemorques(@PathParam("id") long id) {
        return RemorqueClientEntity.list("proprietaire.id = ?1", id);
    }

    @GET
    @Path("/clients/{id}/ventes")
    public List<VenteEntity> getClientVentes(@PathParam("id") long id) {
        return VenteEntity.list("client.id = ?1", id);
    }
}
