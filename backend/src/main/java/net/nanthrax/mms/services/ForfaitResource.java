package net.nanthrax.mms.services;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.transaction.Transactional;
import java.util.List;
import net.nanthrax.mms.persistence.ForfaitEntity;

@Path("/forfaits")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ForfaitResource {

    @GET
    public List<ForfaitEntity> getAll() {
        return ForfaitEntity.listAll();
    }

    @GET
    @Path("{id}")
    public ForfaitEntity getOne(@PathParam("id") Long id) {
        ForfaitEntity entity = ForfaitEntity.findById(id);
        if (entity == null) {
            throw new NotFoundException("Forfait not found: " + id);
        }
        return entity;
    }

    @GET
    @Path("/search")
    public List<ForfaitEntity> search(@QueryParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ForfaitEntity.listAll();
        }
        String likeQuery = "%" + query.toLowerCase() + "%";
        return ForfaitEntity.list("lower(nom) like ?1", likeQuery);
    }

    @POST
    @Transactional
    public Response create(ForfaitEntity forfait) {
        forfait.id = null; // ensure id is not set
        forfait.persist();
        return Response.status(Response.Status.CREATED).entity(forfait).build();
    }

    @PUT
    @Path("{id}")
    @Transactional
    public ForfaitEntity update(@PathParam("id") Long id, ForfaitEntity newForfait) {
        ForfaitEntity existing = ForfaitEntity.findById(id);
        if (existing == null) {
            throw new NotFoundException("Forfait not found: " + id);
        }
        existing.nom = newForfait.nom;
        existing.moteurs = newForfait.moteurs;
        existing.bateaux = newForfait.bateaux;
        existing.heuresFonctionnement = newForfait.heuresFonctionnement;
        existing.joursFrequence = newForfait.joursFrequence;
        existing.competences = newForfait.competences;
        existing.prixHT = newForfait.prixHT;
        existing.tva = newForfait.tva;
        existing.montantTVA = newForfait.montantTVA;
        existing.prixTTC = newForfait.prixTTC;
        return existing;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = ForfaitEntity.deleteById(id);
        if (!deleted) {
            throw new NotFoundException("Forfait not found: " + id);
        }
        return Response.noContent().build();
    }
}