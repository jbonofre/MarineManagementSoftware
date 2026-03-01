package net.nanthrax.moussaillon.services;

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
import net.nanthrax.moussaillon.persistence.VenteEntity;

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
    public List<VenteEntity> search(
            @QueryParam("status") String status,
            @QueryParam("type") String type,
            @QueryParam("clientId") Long clientId
    ) {
        VenteEntity.Status parsedStatus = parseStatus(status);
        VenteEntity.Type parsedType = parseType(type);
        boolean hasStatus = parsedStatus != null;
        boolean hasType = parsedType != null;
        boolean hasClientId = clientId != null;

        if (hasStatus && hasType && hasClientId) {
            return VenteEntity.list("status = ?1 and type = ?2 and client.id = ?3", parsedStatus, parsedType, clientId);
        }
        if (hasStatus && hasType) {
            return VenteEntity.list("status = ?1 and type = ?2", parsedStatus, parsedType);
        }
        if (hasStatus && hasClientId) {
            return VenteEntity.list("status = ?1 and client.id = ?2", parsedStatus, clientId);
        }
        if (hasType && hasClientId) {
            return VenteEntity.list("type = ?1 and client.id = ?2", parsedType, clientId);
        }
        if (hasStatus) {
            return VenteEntity.list("status = ?1", parsedStatus);
        }
        if (hasType) {
            return VenteEntity.list("type = ?1", parsedType);
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
        entity.type = vente.type;
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
        entity.modePaiement = vente.modePaiement;

        return entity;
    }

    private VenteEntity.Status parseStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return null;
        }
        try {
            return VenteEntity.Status.valueOf(status.trim());
        } catch (IllegalArgumentException ex) {
            throw new WebApplicationException("Statut de vente invalide: " + status, 400);
        }
    }

    private VenteEntity.Type parseType(String type) {
        if (type == null || type.trim().isEmpty()) {
            return null;
        }
        try {
            return VenteEntity.Type.valueOf(type.trim());
        } catch (IllegalArgumentException ex) {
            throw new WebApplicationException("Type de vente invalide: " + type, 400);
        }
    }
}
