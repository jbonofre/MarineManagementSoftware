package net.nanthrax.mms.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.mms.persistence.MoteurCatalogueEntity;

import java.util.List;

@Path("/catalogue/moteurs")
@ApplicationScoped
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class MoteurCatalogueResource {

    @GET
    public List<MoteurCatalogueEntity> list() {
        return MoteurCatalogueEntity.listAll();
    }

    @GET
    @Path("{id}")
    public MoteurCatalogueEntity get(@PathParam("id") Long id) {
        MoteurCatalogueEntity entity = MoteurCatalogueEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le moteur (" + id + ") n'est pas trouvé", 404);
        }
        return entity;
    }

    @POST
    @Transactional
    public MoteurCatalogueEntity create(MoteurCatalogueEntity moteur) {
        moteur.persist();
        return moteur;
    }

    @PUT
    @Path("{id}")
    @Transactional
    public MoteurCatalogueEntity update(@PathParam("id") Long id, MoteurCatalogueEntity moteur) {
        MoteurCatalogueEntity entity = MoteurCatalogueEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le moteur (" + id + ") n'est pas trouvé", 404);
        }

        // update the relevant fields
        entity.modele = moteur.modele;
        entity.marque = moteur.marque;
        entity.type = moteur.type;
        entity.notes = moteur.notes;
        entity.evaluation = moteur.evaluation;
        entity.image = moteur.image;
        entity.puissanceCv = moteur.puissanceCv;
        entity.puissanceKw = moteur.puissanceKw;
        entity.longueurArbre = moteur.longueurArbre;
        entity.arbre = moteur.arbre;
        entity.demarrage = moteur.demarrage;
        entity.barre = moteur.barre;
        entity.cylindres = moteur.cylindres;
        entity.cylindree = moteur.cylindree;
        entity.regime = moteur.regime;
        entity.huileRecommandee = moteur.huileRecommandee;

        // Panache updates are flushed automatically at transaction close
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        MoteurCatalogueEntity entity = MoteurCatalogueEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le moteur (" + id + ") n'est pas trouvé", 404);
        }
        entity.delete();
        return Response.status(204).build();
    }
}
