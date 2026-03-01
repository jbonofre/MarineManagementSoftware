package net.nanthrax.moussaillon.services;

import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.moussaillon.persistence.CompetenceEntity;

@Path("/competences")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CompetenceResource {

    @GET
    public List<CompetenceEntity> list() {
        return CompetenceEntity.listAll();
    }

    @GET
    @Path("/search")
    public List<CompetenceEntity> search(@QueryParam("q") String q) {
        if (q == null || q.trim().isEmpty()) {
            return CompetenceEntity.listAll();
        }
        String likePattern = "%" + q.toLowerCase() + "%";
        return CompetenceEntity.list("LOWER(nom) LIKE ?1 OR LOWER(description) LIKE ?1", likePattern);
    }

    @POST
    @Transactional
    public CompetenceEntity create(CompetenceEntity competence) {
        competence.persist();
        return competence;
    }

    @GET
    @Path("{id}")
    public CompetenceEntity get(@PathParam("id") long id) {
        CompetenceEntity entity = CompetenceEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("La compétence (" + id + ") n'est pas trouvée", 404);
        }
        return entity;
    }

    @PUT
    @Path("{id}")
    @Transactional
    public CompetenceEntity update(@PathParam("id") long id, CompetenceEntity competence) {
        CompetenceEntity entity = CompetenceEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("La compétence (" + id + ") n'est pas trouvée", 404);
        }

        entity.nom = competence.nom;
        entity.description = competence.description;
        entity.couleur = competence.couleur;
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(@PathParam("id") long id) {
        CompetenceEntity entity = CompetenceEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("La compétence (" + id + ") n'est pas trouvée", 404);
        }
        entity.delete();
        return Response.status(204).build();
    }
}
