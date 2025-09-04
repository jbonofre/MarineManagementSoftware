package net.nanthrax.mms.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
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
        produit.persist();
        return produit;
    }

}
