package net.nanthrax.mms.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.mms.persistence.HeliceEntity;

import java.util.List;

@Path("/catalogue/helices")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class HeliceResource {

    @GET
    public List<HeliceEntity> list() {
        return HeliceEntity.listAll();
    }

    @POST
    @Transactional
    public HeliceEntity create(HeliceEntity helice) {
        helice.persist();
        return helice;
    }

    @GET
    @Path("{id}")
    public HeliceEntity get(long id) {
        HeliceEntity entity = HeliceEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("L'hélice (" + id + ") n'est pas trouvée", 404);
        }
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(long id) {
        HeliceEntity entity = HeliceEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("L'hélice (" + id + ") n'est pas trouvée", 404);
        }
        entity.delete();
        return Response.status(204).build();
    }

    @PUT
    @Path("{id}")
    @Transactional
    public HeliceEntity update(long id, HeliceEntity helice) {
        HeliceEntity entity = HeliceEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("L'hélice (" + id + ") n'est pas trouvée", 404);
        }

        entity.modele = helice.modele;
        entity.marque = helice.marque;
        entity.description = helice.description;
        entity.evaluation = helice.evaluation;
        entity.diametre = helice.diametre;
        entity.pas = helice.pas;
        entity.pales = helice.pales;
        entity.cannelures = helice.cannelures;
        // entity.compatible = helice.compatible;
        entity.prixVenteTTC = helice.prixVenteTTC;

        return entity;
    }

}
