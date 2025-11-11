package net.nanthrax.mms.services;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.transaction.Transactional;
import java.util.List;
import net.nanthrax.mms.persistence.BateauCatalogueEntity;

@Path("/catalogue/bateaux")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BateauCatalogueResource {

    @GET
    public List<BateauCatalogueEntity> listAll() {
        return BateauCatalogueEntity.listAll();
    }

    @GET
    @Path("/search")
    public List<BateauCatalogueEntity> search(@QueryParam("q") String q) {
        if (q == null || q.trim().isEmpty()) {
            return BateauCatalogueEntity.listAll();
        }
        String likePattern = "%" + q.toLowerCase() + "%";
        // Search in modele, marque, type, description
        return BateauCatalogueEntity.list(
            "LOWER(modele) LIKE ?1 OR LOWER(marque) LIKE ?1 OR LOWER(type) LIKE ?1 OR LOWER(description) LIKE ?1",
            likePattern
        );
    }

    @GET
    @Path("/{id}")
    public BateauCatalogueEntity get(@PathParam("id") Long id) {
        BateauCatalogueEntity entity = BateauCatalogueEntity.findById(id);
        if (entity == null) {
            throw new NotFoundException();
        }
        return entity;
    }

    @POST
    @Transactional
    public Response create(BateauCatalogueEntity bateauCatalogue) {
        bateauCatalogue.id = null;
        BateauCatalogueEntity.persist(bateauCatalogue);
        return Response.status(Response.Status.CREATED).entity(bateauCatalogue).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, BateauCatalogueEntity updatedBateauCatalogue) {
        BateauCatalogueEntity entity = BateauCatalogueEntity.findById(id);
        if (entity == null) {
            throw new NotFoundException();
        }
        entity.modele = updatedBateauCatalogue.modele;
        entity.marque = updatedBateauCatalogue.marque;
        entity.images = updatedBateauCatalogue.images;
        entity.type = updatedBateauCatalogue.type;
        entity.description = updatedBateauCatalogue.description;
        entity.longueurExterieure = updatedBateauCatalogue.longueurExterieure;
        entity.longueurCoque = updatedBateauCatalogue.longueurCoque;
        entity.hauteur = updatedBateauCatalogue.hauteur;
        entity.largeur = updatedBateauCatalogue.largeur;
        entity.tirantAir = updatedBateauCatalogue.tirantAir;
        entity.tirantEau = updatedBateauCatalogue.tirantEau;
        entity.poidsVide = updatedBateauCatalogue.poidsVide;
        entity.poidsMoteurMax = updatedBateauCatalogue.poidsMoteurMax;
        entity.chargeMax = updatedBateauCatalogue.chargeMax;
        entity.longueurArbre = updatedBateauCatalogue.longueurArbre;
        entity.puissanceMax = updatedBateauCatalogue.puissanceMax;
        entity.reservoirEau = updatedBateauCatalogue.reservoirEau;
        entity.reservoirCarburant = updatedBateauCatalogue.reservoirCarburant;
        entity.nombrePassagersMax = updatedBateauCatalogue.nombrePassagersMax;
        entity.categorieCe = updatedBateauCatalogue.categorieCe;
        return Response.ok(entity).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        BateauCatalogueEntity entity = BateauCatalogueEntity.findById(id);
        if (entity == null) {
            throw new NotFoundException();
        }
        entity.delete();
        return Response.noContent().build();
    }
}
