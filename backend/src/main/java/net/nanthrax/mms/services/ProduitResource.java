package net.nanthrax.mms.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.mms.persistence.ProduitEntity;

import java.util.List;

@Path("/catalogue")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProduitResource {

    @GET
    public List<ProduitEntity> list() {
        return ProduitEntity.listAll();
    }

    @POST
    @Transactional
    public ProduitEntity create(ProduitEntity produit) {
        produit.montantTVA = produit.prixVenteHT * (produit.tva / 100);
        produit.prixVenteTTC = produit.prixVenteHT + produit.montantTVA;
        produit.persist();
        return produit;
    }

    @GET
    @Path("{id}")
    public ProduitEntity get(int id) {
        ProduitEntity entity = ProduitEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le produit (" + id + ") n'est pas trouvé", 404);
        }
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(int id) {
        ProduitEntity entity = ProduitEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le produit (" + id + ") n'est pas trouvé", 404);
        }
        entity.delete();
        return Response.status(204).build();
    }

    @PUT
    @Path("{id}")
    @Transactional
    public ProduitEntity update(int id, ProduitEntity produit) {
        ProduitEntity entity = ProduitEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le produit (" + id + ") n'est pas trouvé", 404);
        }

        produit.montantTVA = produit.prixVenteHT * (produit.tva / 100);
        produit.prixVenteTTC = produit.prixVenteHT + produit.montantTVA;

        entity.nom = produit.nom;
        entity.marque = produit.marque;
        entity.categorie = produit.categorie;
        entity.ref = produit.ref;
        entity.refs = produit.refs;
        entity.image = produit.image;
        entity.images = produit.images;
        entity.description = produit.description;
        entity.evaluation = produit.evaluation;
        entity.stock = produit.stock;
        entity.stockMini = produit.stockMini;
        entity.emplacement = produit.emplacement;
        entity.prixCatalogue = produit.prixCatalogue;
        entity.prixAchat = produit.prixAchat;
        entity.frais = produit.frais;
        entity.tauxMarge = produit.tauxMarge;
        entity.tauxMarque = produit.tauxMarque;
        entity.prixVenteHT = produit.prixVenteHT;
        entity.tva = produit.tva;
        entity.montantTVA = produit.montantTVA;
        entity.prixVenteTTC = produit.prixVenteTTC;

        return entity;
    }

}
