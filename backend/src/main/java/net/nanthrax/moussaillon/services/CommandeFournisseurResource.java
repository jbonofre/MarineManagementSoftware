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
import net.nanthrax.moussaillon.persistence.CommandeFournisseurEntity;
import net.nanthrax.moussaillon.persistence.CommandeFournisseurLigneEntity;
import net.nanthrax.moussaillon.persistence.ProduitCatalogueEntity;

@Path("/commandes-fournisseur")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CommandeFournisseurResource {

    @GET
    public List<CommandeFournisseurEntity> list() {
        return CommandeFournisseurEntity.listAll();
    }

    @GET
    @Path("/search")
    public List<CommandeFournisseurEntity> search(
            @QueryParam("status") String status,
            @QueryParam("fournisseurId") Long fournisseurId
    ) {
        CommandeFournisseurEntity.Status parsedStatus = parseStatus(status);
        boolean hasStatus = parsedStatus != null;
        boolean hasFournisseurId = fournisseurId != null;

        if (hasStatus && hasFournisseurId) {
            return CommandeFournisseurEntity.list("status = ?1 and fournisseur.id = ?2", parsedStatus, fournisseurId);
        }
        if (hasStatus) {
            return CommandeFournisseurEntity.list("status = ?1", parsedStatus);
        }
        if (hasFournisseurId) {
            return CommandeFournisseurEntity.list("fournisseur.id = ?1", fournisseurId);
        }
        return CommandeFournisseurEntity.listAll();
    }

    @POST
    @Transactional
    public Response create(CommandeFournisseurEntity commande) {
        commande.id = null;
        commande.persist();
        return Response.status(Response.Status.CREATED).entity(commande).build();
    }

    @GET
    @Path("{id}")
    public CommandeFournisseurEntity get(@PathParam("id") long id) {
        CommandeFournisseurEntity entity = CommandeFournisseurEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("La commande fournisseur (" + id + ") n'est pas trouvee", 404);
        }
        return entity;
    }

    @DELETE
    @Path("{id}")
    @Transactional
    public Response delete(@PathParam("id") long id) {
        CommandeFournisseurEntity entity = CommandeFournisseurEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("La commande fournisseur (" + id + ") n'est pas trouvee", 404);
        }
        entity.delete();
        return Response.status(204).build();
    }

    @PUT
    @Path("{id}")
    @Transactional
    public CommandeFournisseurEntity update(@PathParam("id") long id, CommandeFournisseurEntity commande) {
        CommandeFournisseurEntity entity = CommandeFournisseurEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("La commande fournisseur (" + id + ") n'est pas trouvee", 404);
        }

        entity.status = commande.status;
        entity.fournisseur = commande.fournisseur;
        entity.date = commande.date;
        entity.dateReception = commande.dateReception;
        entity.reference = commande.reference;
        entity.referenceFournisseur = commande.referenceFournisseur;
        entity.montantHT = commande.montantHT;
        entity.tva = commande.tva;
        entity.montantTVA = commande.montantTVA;
        entity.montantTTC = commande.montantTTC;
        entity.portTotal = commande.portTotal;
        entity.notes = commande.notes;

        if (entity.lignes != null) {
            entity.lignes.clear();
        }
        if (commande.lignes != null) {
            for (CommandeFournisseurLigneEntity incomingLigne : commande.lignes) {
                CommandeFournisseurLigneEntity clonedLigne = new CommandeFournisseurLigneEntity();
                clonedLigne.produit = incomingLigne.produit;
                clonedLigne.quantite = incomingLigne.quantite;
                clonedLigne.prixUnitaireHT = incomingLigne.prixUnitaireHT;
                clonedLigne.tva = incomingLigne.tva;
                clonedLigne.montantTVA = incomingLigne.montantTVA;
                clonedLigne.prixTotalHT = incomingLigne.prixTotalHT;
                clonedLigne.prixTotalTTC = incomingLigne.prixTotalTTC;
                entity.lignes.add(clonedLigne);
            }
        }

        // Incrementer le stock quand la commande est recue
        if (!entity.stockIncremented && entity.status == CommandeFournisseurEntity.Status.RECUE) {
            incrementStock(entity);
            entity.stockIncremented = true;
        }

        return entity;
    }

    private void incrementStock(CommandeFournisseurEntity commande) {
        if (commande.lignes != null) {
            for (CommandeFournisseurLigneEntity ligne : commande.lignes) {
                if (ligne.produit != null) {
                    ProduitCatalogueEntity p = ProduitCatalogueEntity.findById(ligne.produit.id);
                    if (p != null) {
                        p.stock = p.stock + ligne.quantite;
                    }
                }
            }
        }
    }

    private CommandeFournisseurEntity.Status parseStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return null;
        }
        try {
            return CommandeFournisseurEntity.Status.valueOf(status.trim());
        } catch (IllegalArgumentException ex) {
            throw new WebApplicationException("Statut de commande fournisseur invalide: " + status, 400);
        }
    }
}
