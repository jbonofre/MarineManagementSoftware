package net.nanthrax.mms.services;

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
import net.nanthrax.mms.persistence.ForfaitEntity;

@Path("/forfaits")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ForfaitResource {

    @GET
    public List<ForfaitEntity> list() {
        return ForfaitEntity.listAll();
    }

    @GET
    @Path("/search")
    public List<ForfaitEntity> search(@QueryParam("q") String q) {
        if (q == null || q.trim().isEmpty()) {
            return ForfaitEntity.listAll();
        }

        String likePattern = "%" + q.toLowerCase() + "%";
        return ForfaitEntity.list("LOWER(nom) LIKE ?1", likePattern);
    }

    @POST
    @Transactional
    public Response create(ForfaitEntity forfait) {
        forfait.persist();
        return Response.status(Response.Status.CREATED).entity(forfait).build();
    }

    @GET
    @Path("{id}")
    public ForfaitEntity get(@PathParam("id") long id) {
        ForfaitEntity entity = ForfaitEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le forfait (" + id + ") n'est pas trouve", 404);
        }
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(@PathParam("id") long id) {
        ForfaitEntity entity = ForfaitEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le forfait (" + id + ") n'est pas trouve", 404);
        }

        entity.delete();
        return Response.status(204).build();
    }

    @PUT
    @Path("{id}")
    @Transactional
    public ForfaitEntity update(@PathParam("id") long id, ForfaitEntity forfait) {
        ForfaitEntity entity = ForfaitEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le forfait (" + id + ") n'est pas trouve", 404);
        }

        entity.nom = forfait.nom;
        entity.moteursAssocies = forfait.moteursAssocies;
        entity.bateauxAssocies = forfait.bateauxAssocies;
        entity.produits.clear();
        if (forfait.produits != null) {
            entity.produits.addAll(forfait.produits);
        }
        entity.services.clear();
        if (forfait.services != null) {
            entity.services.addAll(forfait.services);
        }
        entity.heuresFonctionnement = forfait.heuresFonctionnement;
        entity.joursFrequence = forfait.joursFrequence;
        entity.competences = forfait.competences;
        entity.prixHT = forfait.prixHT;
        entity.tva = forfait.tva;
        entity.montantTVA = forfait.montantTVA;
        entity.prixTTC = forfait.prixTTC;

        return entity;
    }
}
