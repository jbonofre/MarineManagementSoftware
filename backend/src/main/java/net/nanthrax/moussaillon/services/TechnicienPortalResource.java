package net.nanthrax.moussaillon.services;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.moussaillon.persistence.ForfaitEntity;
import net.nanthrax.moussaillon.persistence.ForfaitProduitEntity;
import net.nanthrax.moussaillon.persistence.PrestationEntity;
import net.nanthrax.moussaillon.persistence.PrestationTaskEntity;
import net.nanthrax.moussaillon.persistence.ProduitCatalogueEntity;
import net.nanthrax.moussaillon.persistence.SocieteEntity;
import net.nanthrax.moussaillon.persistence.TechnicienEntity;
import net.nanthrax.moussaillon.persistence.VenteEntity;

@Path("/technicien-portal")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TechnicienPortalResource {

    @Inject
    Mailer mailer;

    public static class LoginRequest {
        public String email;
        public String motDePasse;
    }

    public static class ChangePasswordRequest {
        public Long technicienId;
        public String currentPassword;
        public String newPassword;
    }

    public static class PrestationUpdateRequest {
        public String status;
        public double dureeReelle;
        public String incidentDate;
        public String incidentDetails;
        public String notes;
    }

    public static class TaskToggleRequest {
        public boolean completed;
    }

    public static class PrestationTaskDto {
        public Long id;
        public String nom;
        public String description;
        public boolean completed;

        public static PrestationTaskDto from(PrestationTaskEntity task) {
            PrestationTaskDto dto = new PrestationTaskDto();
            dto.id = task.id;
            dto.nom = task.nom;
            dto.description = task.description;
            dto.completed = task.completed;
            return dto;
        }
    }

    public static class PrestationWithVente {
        public Long prestationId;
        public Long venteId;
        public String prestationNom;
        public String prestationStatus;
        public String dateDebut;
        public String dateFin;
        public String statusDate;
        public String description;
        public String notes;
        public double dureeEstimee;
        public double dureeReelle;
        public String incidentDate;
        public String incidentDetails;
        public String clientNom;
        public String venteType;
        public String bateauNom;
        public List<PrestationTaskDto> taches;

        public static PrestationWithVente from(PrestationEntity prestation, VenteEntity vente) {
            PrestationWithVente pw = new PrestationWithVente();
            pw.prestationId = prestation.id;
            pw.venteId = vente.id;
            pw.prestationNom = prestation.nom;
            pw.prestationStatus = prestation.status != null ? prestation.status.name() : null;
            pw.dateDebut = prestation.dateDebut != null ? prestation.dateDebut.toString() : null;
            pw.dateFin = prestation.dateFin != null ? prestation.dateFin.toString() : null;
            pw.statusDate = prestation.statusDate != null ? prestation.statusDate.toString() : null;
            pw.description = prestation.description;
            pw.notes = prestation.notes;
            pw.dureeEstimee = prestation.dureeEstimee;
            pw.dureeReelle = prestation.dureeReelle;
            pw.incidentDate = prestation.incidentDate != null ? prestation.incidentDate.toString() : null;
            pw.incidentDetails = prestation.incidentDetails;
            if (vente.client != null) {
                pw.clientNom = (vente.client.prenom != null ? vente.client.prenom + " " : "") + vente.client.nom;
            }
            pw.venteType = vente.type != null ? vente.type.name() : null;
            if (vente.bateau != null) {
                pw.bateauNom = vente.bateau.name;
            }
            pw.taches = new ArrayList<>();
            if (prestation.taches != null) {
                for (PrestationTaskEntity task : prestation.taches) {
                    pw.taches.add(PrestationTaskDto.from(task));
                }
            }
            return pw;
        }
    }

    @POST
    @Path("/login")
    public TechnicienEntity login(LoginRequest request) {
        if (request == null || request.email == null || request.email.isBlank()) {
            throw new WebApplicationException("L'email est requis", Response.Status.BAD_REQUEST);
        }
        List<TechnicienEntity> techniciens = TechnicienEntity.list(
                "LOWER(email) = ?1", request.email.toLowerCase().trim());
        if (techniciens.isEmpty()) {
            throw new WebApplicationException("Aucun technicien trouve avec cet email", Response.Status.UNAUTHORIZED);
        }
        TechnicienEntity technicien = techniciens.get(0);
        if (technicien.motDePasse != null && !technicien.motDePasse.isBlank()) {
            if (request.motDePasse == null || !request.motDePasse.equals(technicien.motDePasse)) {
                throw new WebApplicationException("Mot de passe invalide", Response.Status.UNAUTHORIZED);
            }
        }
        return technicien;
    }

    @POST
    @Path("/change-password")
    @Transactional
    public Response changePassword(ChangePasswordRequest request) {
        if (request == null || request.technicienId == null) {
            throw new WebApplicationException("L'identifiant du technicien est requis", Response.Status.BAD_REQUEST);
        }
        if (request.newPassword == null || request.newPassword.isBlank()) {
            throw new WebApplicationException("Le nouveau mot de passe est requis", Response.Status.BAD_REQUEST);
        }
        TechnicienEntity technicien = TechnicienEntity.findById(request.technicienId);
        if (technicien == null) {
            throw new WebApplicationException("Technicien non trouve", Response.Status.NOT_FOUND);
        }
        if (technicien.motDePasse != null && !technicien.motDePasse.isBlank()) {
            if (request.currentPassword == null || !request.currentPassword.equals(technicien.motDePasse)) {
                throw new WebApplicationException("Mot de passe actuel invalide", Response.Status.UNAUTHORIZED);
            }
        }
        technicien.motDePasse = request.newPassword;
        return Response.noContent().build();
    }

    @GET
    @Path("/techniciens/{id}/prestations")
    public List<PrestationWithVente> getTechnicienPrestations(@PathParam("id") long technicienId) {
        TechnicienEntity technicien = TechnicienEntity.findById(technicienId);
        if (technicien == null) {
            throw new WebApplicationException("Technicien non trouve", Response.Status.NOT_FOUND);
        }

        List<VenteEntity> ventes = VenteEntity.listAll();
        List<PrestationWithVente> result = new ArrayList<>();
        for (VenteEntity vente : ventes) {
            if (vente.prestations == null) continue;
            for (PrestationEntity prestation : vente.prestations) {
                if (prestation.technicien != null && prestation.technicien.id.equals(technicienId)) {
                    result.add(PrestationWithVente.from(prestation, vente));
                }
            }
        }
        return result;
    }

    @PUT
    @Path("/prestations/{prestationId}")
    @Transactional
    public PrestationWithVente updatePrestation(@PathParam("prestationId") long prestationId, PrestationUpdateRequest request) {
        PrestationEntity prestation = PrestationEntity.findById(prestationId);
        if (prestation == null) {
            throw new WebApplicationException("Prestation non trouvee", Response.Status.NOT_FOUND);
        }

        if (request.status != null && !request.status.isBlank()) {
            prestation.status = PrestationEntity.Status.valueOf(request.status);
        }
        prestation.dureeReelle = request.dureeReelle;
        if (request.notes != null) {
            prestation.notes = request.notes;
        }

        if ("INCIDENT".equals(request.status)) {
            if (request.incidentDate != null && !request.incidentDate.isBlank()) {
                prestation.incidentDate = Date.valueOf(request.incidentDate);
            }
            prestation.incidentDetails = request.incidentDetails;
        }

        // Find the parent vente for the response
        List<VenteEntity> ventes = VenteEntity.list("SELECT v FROM VenteEntity v JOIN v.prestations p WHERE p.id = ?1", prestationId);
        VenteEntity parentVente = ventes.isEmpty() ? null : ventes.get(0);

        // Send incident notification email to client
        if (prestation.status == PrestationEntity.Status.INCIDENT && parentVente != null
                && parentVente.client != null && parentVente.client.email != null && !parentVente.client.email.isBlank()) {
            sendIncidentNotification(parentVente, prestation);
        }

        // Decrement stock when a prestation transitions to EN_COURS (once per vente)
        if (prestation.status == PrestationEntity.Status.EN_COURS && parentVente != null && !parentVente.stockDecremented) {
            decrementStock(parentVente);
            parentVente.stockDecremented = true;
        }
        if (parentVente == null) {
            // fallback: return a minimal response
            PrestationWithVente pw = new PrestationWithVente();
            pw.prestationId = prestation.id;
            pw.prestationNom = prestation.nom;
            pw.prestationStatus = prestation.status != null ? prestation.status.name() : null;
            pw.dureeReelle = prestation.dureeReelle;
            pw.incidentDate = prestation.incidentDate != null ? prestation.incidentDate.toString() : null;
            pw.incidentDetails = prestation.incidentDetails;
            pw.notes = prestation.notes;
            pw.taches = new ArrayList<>();
            if (prestation.taches != null) {
                for (PrestationTaskEntity task : prestation.taches) {
                    pw.taches.add(PrestationTaskDto.from(task));
                }
            }
            return pw;
        }
        return PrestationWithVente.from(prestation, parentVente);
    }

    @PUT
    @Path("/prestations/{prestationId}/taches/{taskId}")
    @Transactional
    public PrestationTaskDto toggleTask(@PathParam("prestationId") long prestationId, @PathParam("taskId") long taskId, TaskToggleRequest request) {
        PrestationTaskEntity task = PrestationTaskEntity.findById(taskId);
        if (task == null) {
            throw new WebApplicationException("Tache non trouvee", Response.Status.NOT_FOUND);
        }
        task.completed = request.completed;
        return PrestationTaskDto.from(task);
    }

    private void sendIncidentNotification(VenteEntity vente, PrestationEntity prestation) {
        SocieteEntity societe = SocieteEntity.findById(1L);
        String societeNom = societe != null ? societe.nom : "moussAIllon";
        String clientName = vente.client.prenom != null ? vente.client.prenom : vente.client.nom;

        String subject = "Incident sur votre intervention - " + societeNom;
        String body = "Bonjour " + clientName + ",\n\n"
                + "Nous vous informons qu'un incident a ete signale sur l'intervention \"" + prestation.nom + "\".\n\n";
        if (prestation.incidentDetails != null && !prestation.incidentDetails.isBlank()) {
            body += "Details : " + prestation.incidentDetails + "\n\n";
        }
        if (prestation.incidentDate != null) {
            body += "Date de l'incident : " + prestation.incidentDate + "\n\n";
        }
        body += "Notre equipe met tout en oeuvre pour resoudre la situation dans les meilleurs delais.\n\n"
                + "Cordialement,\n" + societeNom;

        mailer.send(Mail.withText(vente.client.email, subject, body));
    }

    private void decrementStock(VenteEntity vente) {
        // Decrement stock for direct products on the vente
        if (vente.produits != null) {
            for (ProduitCatalogueEntity produit : vente.produits) {
                ProduitCatalogueEntity p = ProduitCatalogueEntity.findById(produit.id);
                if (p != null) {
                    p.stock = Math.max(0, p.stock - 1);
                }
            }
        }
        // Decrement stock for products in forfaits
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
}
