package net.nanthrax.moussaillon.services;

import java.util.List;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
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
import net.nanthrax.moussaillon.persistence.ForfaitEntity;
import net.nanthrax.moussaillon.persistence.ForfaitProduitEntity;
import net.nanthrax.moussaillon.persistence.ProduitCatalogueEntity;
import net.nanthrax.moussaillon.persistence.SocieteEntity;
import net.nanthrax.moussaillon.persistence.TaskEntity;
import net.nanthrax.moussaillon.persistence.VenteEntity;

@Path("/ventes")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class VenteResource {

    @Inject
    Mailer mailer;

    @Inject
    RappelScheduler rappelScheduler;

    @POST
    @Path("{id}/rappel")
    @Transactional
    public Response envoyerRappelManuel(@PathParam("id") long id) {
        VenteEntity entity = VenteEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("La vente (" + id + ") n'est pas trouvee", 404);
        }
        if (entity.client == null || entity.client.email == null || entity.client.email.isBlank()) {
            throw new WebApplicationException("Le client n'a pas d'adresse email", 400);
        }
        rappelScheduler.envoyerRappel(entity, 0);
        return Response.ok().build();
    }

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

        if (entity.taches != null) {
            entity.taches.clear();
        }
        if (vente.taches != null) {
            if (entity.taches == null) {
                throw new IllegalStateException("La collection de taches n'est pas initialisee");
            }
            for (TaskEntity incomingTask : vente.taches) {
                TaskEntity clonedTask = new TaskEntity();
                clonedTask.nom = incomingTask.nom;
                clonedTask.status = incomingTask.status;
                clonedTask.dateDebut = incomingTask.dateDebut;
                clonedTask.dateFin = incomingTask.dateFin;
                clonedTask.statusDate = incomingTask.statusDate;
                clonedTask.description = incomingTask.description;
                clonedTask.notes = incomingTask.notes;
                clonedTask.technicien = incomingTask.technicien;
                clonedTask.dureeEstimee = incomingTask.dureeEstimee;
                clonedTask.dureeReelle = incomingTask.dureeReelle;
                clonedTask.incidentDate = incomingTask.incidentDate;
                clonedTask.incidentDetails = incomingTask.incidentDetails;
                entity.taches.add(clonedTask);
            }
        }

        // Send incident notification email to client for any INCIDENT tasks
        if (entity.client != null && entity.client.email != null && !entity.client.email.isBlank()) {
            for (TaskEntity t : entity.taches) {
                if (t.status == TaskEntity.Status.INCIDENT) {
                    sendIncidentNotification(entity, t);
                }
            }
        }

        // Decrement stock when a task transitions to EN_COURS (once per vente)
        if (!entity.stockDecremented) {
            boolean hasEnCours = entity.taches.stream()
                    .anyMatch(t -> t.status == TaskEntity.Status.EN_COURS);
            if (hasEnCours) {
                decrementStock(entity);
                entity.stockDecremented = true;
            }
        }

        entity.date = vente.date;
        entity.remise = vente.remise;
        entity.montantTTC = vente.montantTTC;
        entity.tva = vente.tva;
        entity.montantTVA = vente.montantTVA;
        entity.prixVenteTTC = vente.prixVenteTTC;
        entity.modePaiement = vente.modePaiement;

        // Reinitialiser les drapeaux d'envoi si les intervalles ont change
        if (!java.util.Objects.equals(entity.rappel1Jours, vente.rappel1Jours)) {
            entity.rappel1Envoye = false;
        }
        if (!java.util.Objects.equals(entity.rappel2Jours, vente.rappel2Jours)) {
            entity.rappel2Envoye = false;
        }
        if (!java.util.Objects.equals(entity.rappel3Jours, vente.rappel3Jours)) {
            entity.rappel3Envoye = false;
        }
        entity.rappel1Jours = vente.rappel1Jours;
        entity.rappel2Jours = vente.rappel2Jours;
        entity.rappel3Jours = vente.rappel3Jours;

        return entity;
    }

    private void sendIncidentNotification(VenteEntity vente, TaskEntity task) {
        SocieteEntity societe = SocieteEntity.findById(1L);
        String societeNom = societe != null ? societe.nom : "moussAIllon";
        String clientName = vente.client.prenom != null ? vente.client.prenom : vente.client.nom;

        String subject = "Incident sur votre intervention - " + societeNom;
        String body = "Bonjour " + clientName + ",\n\n"
                + "Nous vous informons qu'un incident a ete signale sur l'intervention \"" + task.nom + "\".\n\n";
        if (task.incidentDetails != null && !task.incidentDetails.isBlank()) {
            body += "Details : " + task.incidentDetails + "\n\n";
        }
        if (task.incidentDate != null) {
            body += "Date de l'incident : " + task.incidentDate + "\n\n";
        }
        body += "Notre equipe met tout en oeuvre pour resoudre la situation dans les meilleurs delais.\n\n"
                + "Cordialement,\n" + societeNom;

        mailer.send(Mail.withText(vente.client.email, subject, body));
    }

    private void decrementStock(VenteEntity vente) {
        if (vente.produits != null) {
            for (ProduitCatalogueEntity produit : vente.produits) {
                ProduitCatalogueEntity p = ProduitCatalogueEntity.findById(produit.id);
                if (p != null) {
                    p.stock = Math.max(0, p.stock - 1);
                }
            }
        }
        if (vente.forfaits != null) {
            for (ForfaitEntity forfait : vente.forfaits) {
                ForfaitEntity f = ForfaitEntity.findById(forfait.id);
                if (f != null && f.produits != null) {
                    for (ForfaitProduitEntity fp : f.produits) {
                        if (fp.produit != null) {
                            ProduitCatalogueEntity p = ProduitCatalogueEntity.findById(fp.produit.id);
                            if (p != null) {
                                p.stock = Math.max(0, p.stock - fp.quantite);
                            }
                        }
                    }
                }
            }
        }
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
