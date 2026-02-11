package net.nanthrax.mms.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.mms.persistence.ServiceEntity;

import java.util.List;

@Path("/services")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ServiceResource {

    @GET
    public List<ServiceEntity> list() {
        return ServiceEntity.listAll();
    }

    @GET
    @Path("/search")
    public List<ServiceEntity> search(@QueryParam("q") String q) {
        if (q == null || q.trim().isEmpty()) {
            return ServiceEntity.listAll();
        }
        String likePattern = "%" + q.toLowerCase() + "%";
        return ServiceEntity.list("LOWER(nom) LIKE ?1 OR LOWER(description) LIKE ?1", likePattern);
    }

    @POST
    @Transactional
    public ServiceEntity create(ServiceEntity service) {
        service.persist();
        return service;
    }

    @GET
    @Path("{id}")
    public ServiceEntity get(long id) {
        ServiceEntity entity = ServiceEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le service (" + id + ") n'est pas trouvé", 404);
        }
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(long id) {
        ServiceEntity entity = ServiceEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le service (" + id + ") n'est pas trouvé", 404);
        }
        entity.delete();
        return Response.status(204).build();
    }

    @PUT
    @Path("{id}")
    @Transactional
    public ServiceEntity update(long id, ServiceEntity service) {
        ServiceEntity entity = ServiceEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le service (" + id + ") n'est pas trouvé", 404);
        }

        entity.nom = service.nom;
        entity.description = service.description;
        entity.prixHT = service.prixHT;
        entity.tva = service.tva;
        entity.montantTVA = service.montantTVA;
        entity.prixTTC = service.prixTTC;
        entity.competences = service.competences;

        return entity;
    }
}
