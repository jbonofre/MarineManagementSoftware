package net.nanthrax.moussaillon.services;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.moussaillon.persistence.TransactionEntity;

import java.util.List;

@Path("/transactions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TransactionResource {

    @GET
    public List<TransactionEntity> getAll() {
        return TransactionEntity.listAll();
    }

    @GET
    @Path("/{id}")
    public TransactionEntity getById(@PathParam("id") Long id) {
        TransactionEntity entity = TransactionEntity.findById(id);
        if (entity == null) {
            throw new NotFoundException();
        }
        return entity;
    }

    @GET
    @Path("/search")
    public List<TransactionEntity> search(@QueryParam("status") String status,
                                          @QueryParam("clientId") Long clientId) {
        String query = "";
        boolean hasStatus = status != null && !status.isEmpty();
        boolean hasClientId = clientId != null;
        if (hasStatus && hasClientId) {
            query = "status = ?1 and client.id = ?2";
            return TransactionEntity.list(query, status, clientId);
        } else if (hasStatus) {
            query = "status = ?1";
            return TransactionEntity.list(query, status);
        } else if (hasClientId) {
            query = "client.id = ?1";
            return TransactionEntity.list(query, clientId);
        } else {
            return TransactionEntity.listAll();
        }
    }

    @POST
    @Transactional
    public Response create(TransactionEntity transaction) {
        transaction.id = null;
        transaction.persist();
        return Response.status(Response.Status.CREATED).entity(transaction).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, TransactionEntity updated) {
        TransactionEntity entity = TransactionEntity.findById(id);
        if (entity == null) {
            throw new NotFoundException();
        }
        entity.status = updated.status;
        entity.dateStatus = updated.dateStatus;
        entity.dateCreation = updated.dateCreation;
        entity.dateLivraison = updated.dateLivraison;
        entity.datePaiement = updated.datePaiement;
        entity.dateEcheance = updated.dateEcheance;
        entity.montantHT = updated.montantHT;
        entity.remise = updated.remise;
        entity.client = updated.client;
        entity.articles = updated.articles;
        entity.bateaux = updated.bateaux;
        entity.moteurs = updated.moteurs;
        return Response.ok(entity).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = TransactionEntity.deleteById(id);
        if (!deleted) {
            throw new NotFoundException();
        }
        return Response.noContent().build();
    }
}
