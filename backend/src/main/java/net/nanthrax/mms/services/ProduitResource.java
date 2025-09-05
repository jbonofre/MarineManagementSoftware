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
        produit.persist();
        return produit;
    }

    @GET
    @Path("{id}")
    public ProduitEntity get(int id) {
        ProduitEntity entity = ProduitEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le produit n'est pas trouvé", 404);
        }
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(int id) {
        ProduitEntity entity = ProduitEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Le produit n'est pas trouvé", 404);
        }
        entity.delete();
        return Response.status(204).build();
    }

}
