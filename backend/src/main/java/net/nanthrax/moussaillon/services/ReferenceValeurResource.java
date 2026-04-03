package net.nanthrax.moussaillon.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.moussaillon.persistence.ReferenceValeurEntity;

import java.util.List;

@Path("/reference-valeurs")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ReferenceValeurResource {

    @GET
    public List<ReferenceValeurEntity> list(@QueryParam("type") String type) {
        if (type != null && !type.trim().isEmpty()) {
            return ReferenceValeurEntity.list("type = ?1 order by ordre, valeur", type);
        }
        return ReferenceValeurEntity.list("order by type, ordre, valeur");
    }

    @GET
    @Path("{id}")
    public ReferenceValeurEntity get(@PathParam("id") long id) {
        ReferenceValeurEntity entity = ReferenceValeurEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("La valeur de référence (" + id + ") n'est pas trouvée", 404);
        }
        return entity;
    }

    @POST
    @Transactional
    public ReferenceValeurEntity create(ReferenceValeurEntity valeur) {
        valeur.persist();
        return valeur;
    }

    @PUT
    @Path("{id}")
    @Transactional
    public ReferenceValeurEntity update(@PathParam("id") long id, ReferenceValeurEntity valeur) {
        ReferenceValeurEntity entity = ReferenceValeurEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("La valeur de référence (" + id + ") n'est pas trouvée", 404);
        }
        entity.type = valeur.type;
        entity.valeur = valeur.valeur;
        entity.ordre = valeur.ordre;
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(@PathParam("id") long id) {
        ReferenceValeurEntity entity = ReferenceValeurEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("La valeur de référence (" + id + ") n'est pas trouvée", 404);
        }
        entity.delete();
        return Response.status(204).build();
    }

}
