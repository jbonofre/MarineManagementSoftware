package net.nanthrax.mms.services;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import net.nanthrax.mms.persistence.MoteurClientEntity;
import net.nanthrax.mms.persistence.ClientEntity;
import net.nanthrax.mms.persistence.MoteurCatalogueEntity;

@Path("/moteurs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MoteurClientResource {

    @GET
    public List<MoteurClientEntity> listAll() {
        return MoteurClientEntity.listAll();
    }

    @GET
    @Path("/{id}")
    public MoteurClientEntity getById(@PathParam("id") Long id) {
        return MoteurClientEntity.findById(id);
    }

    @GET
    @Path("/search")
    public List<MoteurClientEntity> search(@QueryParam("q") String q) {
        if (q == null || q.trim().isEmpty()) {
            return MoteurClientEntity.listAll();
        }
        String likePattern = "%" + q.toLowerCase() + "%";
        return MoteurClientEntity.list("LOWER(numeroSerie) like ?1", likePattern);
    }

    @POST
    @Transactional
    public MoteurClientEntity create(MoteurClientEntity moteur) {
        if (moteur.proprietaire != null && moteur.proprietaire.id != null) {
            moteur.proprietaire = ClientEntity.findById(moteur.proprietaire.id);
        }
        if (moteur.modele != null && moteur.modele.id != null) {
            moteur.modele = MoteurCatalogueEntity.findById(moteur.modele.id);
        }
        moteur.id = null;
        moteur.persist();
        return moteur;
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public MoteurClientEntity update(@PathParam("id") Long id, MoteurClientEntity updatedMoteur) {
        MoteurClientEntity moteur = MoteurClientEntity.findById(id);
        if (moteur == null) {
            throw new NotFoundException();
        }
        moteur.images = updatedMoteur.images;
        moteur.numeroSerie = updatedMoteur.numeroSerie;
        moteur.numeroClef = updatedMoteur.numeroClef;
        moteur.dateMeS = updatedMoteur.dateMeS;
        moteur.dateAchat = updatedMoteur.dateAchat;
        moteur.dateFinDeGuarantie = updatedMoteur.dateFinDeGuarantie;

        if (updatedMoteur.proprietaire != null && updatedMoteur.proprietaire.id != null) {
            moteur.proprietaire = ClientEntity.findById(updatedMoteur.proprietaire.id);
        } else {
            moteur.proprietaire = null;
        }

        if (updatedMoteur.modele != null && updatedMoteur.modele.id != null) {
            moteur.modele = MoteurCatalogueEntity.findById(updatedMoteur.modele.id);
        } else {
            moteur.modele = null;
        }

        return moteur;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public void delete(@PathParam("id") Long id) {
        MoteurClientEntity moteur = MoteurClientEntity.findById(id);
        if (moteur == null) {
            throw new NotFoundException();
        }
        moteur.delete();
    }
}
