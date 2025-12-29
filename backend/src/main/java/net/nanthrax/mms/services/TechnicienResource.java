package net.nanthrax.mms.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.mms.persistence.TechnicienEntity;

import java.util.List;

@Path("/techniciens")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TechnicienResource {

    @GET
    public List<TechnicienEntity> list() {
        return TechnicienEntity.listAll();
    }

    @GET
    @Path("/search")
    public List<TechnicienEntity> search(@QueryParam("q") String q) {
        if (q == null || q.trim().isEmpty()) {
            return TechnicienEntity.listAll();
        }
        String likePattern = "%" + q.toLowerCase() + "%";
        return TechnicienEntity.list("LOWER(nom) LIKE ?1 OR LOWER(prenom) LIKE ?1 OR LOWER(email) LIKE ?1 OR LOWER(telephone) LIKE ?1", likePattern);
    }

    @POST
    @Transactional
    public TechnicienEntity create(TechnicienEntity technicien) {
        technicien.persist();
        return technicien;
    }

    @GET
    @Path("{id}")
    public TechnicienEntity get(long id) {
        TechnicienEntity entity = TechnicienEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le technicien (" + id + ") n'est pas trouvé", 404);
        }
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(long id) {
        TechnicienEntity entity = TechnicienEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le technicien (" + id + ") n'est pas trouvé", 404);
        }
        entity.delete();
        return Response.status(204).build();
    }

    @PUT
    @Path("{id}")
    @Transactional
    public TechnicienEntity update(long id, TechnicienEntity technicien) {
        TechnicienEntity entity = TechnicienEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le technicien (" + id + ") n'est pas trouvé", 404);
        }

        entity.nom = technicien.nom;
        entity.prenom = technicien.prenom;
        entity.motDePasse = technicien.motDePasse;
        entity.email = technicien.email;
        entity.telephone = technicien.telephone;
        entity.competences = technicien.competences;

        return entity;
    }

}
