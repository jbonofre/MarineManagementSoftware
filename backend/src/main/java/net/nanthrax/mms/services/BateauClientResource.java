package net.nanthrax.mms.services;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.mms.persistence.BateauClientEntity;

import java.util.List;

@Path("/bateaux")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BateauClientResource {

    @GET
    public List<BateauClientEntity> listAll() {
        return BateauClientEntity.listAll();
    }

    @GET
    @Path("/{id}")
    public BateauClientEntity getById(@PathParam("id") Long id) {
        BateauClientEntity bateau = BateauClientEntity.findById(id);
        if (bateau == null) {
            throw new NotFoundException();
        }
        return bateau;
    }

    @GET
    @Path("/search")
    public List<BateauClientEntity> search(@QueryParam("q") String q) {
        if (q == null || q.trim().isEmpty()) {
            return BateauClientEntity.listAll();
        }
        String likePattern = "%" + q.toLowerCase() + "%";
        return BateauClientEntity.list("LOWER(name) like ?1 or LOWER(immatriculation) like ?1", likePattern);
    }

    @POST
    @Transactional
    public Response create(BateauClientEntity entity) {
        entity.id = null; // Ensure a new entity is created
        entity.persist();
        return Response.status(Response.Status.CREATED).entity(entity).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, BateauClientEntity updated) {
        BateauClientEntity entity = BateauClientEntity.findById(id);
        if (entity == null) {
            throw new NotFoundException();
        }
        // Update simple fields
        entity.name = updated.name;
        entity.images = updated.images;
        entity.immatriculation = updated.immatriculation;
        entity.numeroSerie = updated.numeroSerie;
        entity.numeroClef = updated.numeroClef;
        entity.dateMeS = updated.dateMeS;
        entity.dateAchat = updated.dateAchat;
        entity.dateFinDeGuarantie = updated.dateFinDeGuarantie;
        entity.proprietaires = updated.proprietaires;
        entity.modele = updated.modele;
        entity.categorieCe = updated.categorieCe;
        entity.assureur = updated.assureur;
        entity.numeroAssurance = updated.numeroAssurance;
        entity.localisation = updated.localisation;
        entity.localisationGps = updated.localisationGps;
        entity.moteurs = updated.moteurs;
        entity.remorque = updated.remorque;
        entity.equipements = updated.equipements;

        return Response.ok(entity).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = BateauClientEntity.deleteById(id);
        if (!deleted) {
            throw new NotFoundException();
        }
        return Response.noContent().build();
    }
}
