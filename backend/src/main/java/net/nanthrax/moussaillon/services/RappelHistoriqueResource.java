package net.nanthrax.moussaillon.services;

import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import net.nanthrax.moussaillon.persistence.RappelHistoriqueEntity;

@Path("/rappels")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RappelHistoriqueResource {

    @GET
    public List<RappelHistoriqueEntity> list() {
        return RappelHistoriqueEntity.list("order by dateEnvoi desc");
    }

    @GET
    @Path("/vente/{venteId}")
    public List<RappelHistoriqueEntity> listByVente(@PathParam("venteId") long venteId) {
        return RappelHistoriqueEntity.list("vente.id = ?1 order by dateEnvoi desc", venteId);
    }
}
