package net.nanthrax.mms.services;

import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.mms.persistence.VenteEntity;

@Path("/ventes")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class VenteResource {

    @GET
    public List<VenteEntity> list() {
        return VenteEntity.listAll();
    }

    @GET
    @Path("/search")
    public List<VenteEntity> search(@QueryParam("status") String status, @QueryParam("clientId") Long clientId) {
        boolean hasStatus = status != null && !status.trim().isEmpty();
        boolean hasClientId = clientId != null;

        if (hasStatus && hasClientId) {
            return VenteEntity.list("status = ?1 and client.id = ?2", status, clientId);
        }
        if (hasStatus) {
            return VenteEntity.list("status = ?1", status);
        }
        if (hasClientId) {
            return VenteEntity.list("client.id = ?1", clientId);
        }
        return VenteEntity.listAll();
    }

    @POST
    @Transactional
    public Response create(VenteEntity vente) {
        vente.id = null;
        vente.persist();
        return Response.status(Response.Status.CREATED).entity(vente).build();
    }

    @GET
    @Path("{id}")
    public VenteEntity get(@PathParam("id") long id) {
        VenteEntity entity = VenteEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("La vente (" + id + ") n'est pas trouvee", 404);
        }
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(@PathParam("id") long id) {
        VenteEntity entity = VenteEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("La vente (" + id + ") n'est pas trouvee", 404);
        }

        entity.delete();
        return Response.status(204).build();
    }

    @PUT
    @Path("{id}")
    @Transactional
    public VenteEntity update(@PathParam("id") long id, VenteEntity vente) {
        VenteEntity entity = VenteEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("La vente (" + id + ") n'est pas trouvee", 404);
        }

        entity.status = vente.status;
        entity.client = vente.client;
        entity.bateau = vente.bateau;
        entity.moteur = vente.moteur;
        entity.remorque = vente.remorque;

        if (entity.forfaits != null) {
            entity.forfaits.clear();
        }
        if (vente.forfaits != null) {
            if (entity.forfaits == null) {
                entity.forfaits = vente.forfaits;
            } else {
                entity.forfaits.addAll(vente.forfaits);
            }
        }

        if (entity.produits != null) {
            entity.produits.clear();
        }
        if (vente.produits != null) {
            if (entity.produits == null) {
                entity.produits = vente.produits;
            } else {
                entity.produits.addAll(vente.produits);
            }
        }

        if (entity.services != null) {
            entity.services.clear();
        }
        if (vente.services != null) {
            if (entity.services == null) {
                entity.services = vente.services;
            } else {
                entity.services.addAll(vente.services);
            }
        }

        entity.date = vente.date;
        entity.montantHT = vente.montantHT;
        entity.remise = vente.remise;
        entity.montantTTC = vente.montantTTC;
        entity.tva = vente.tva;
        entity.montantTVA = vente.montantTVA;
        entity.prixVenteTTC = vente.prixVenteTTC;

        return entity;
    }
}
