package net.nanthrax.moussaillon.services;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
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
import net.nanthrax.moussaillon.persistence.TaskEntity;
import net.nanthrax.moussaillon.persistence.TechnicienEntity;
import net.nanthrax.moussaillon.persistence.VenteEntity;

@Path("/technicien-portal")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TechnicienPortalResource {

    public static class LoginRequest {
        public String email;
        public String motDePasse;
    }

    public static class TaskUpdateRequest {
        public String status;
        public double dureeReelle;
        public String incidentDate;
        public String incidentDetails;
        public String notes;
    }

    public static class TaskWithVente {
        public Long taskId;
        public Long venteId;
        public String taskNom;
        public String taskStatus;
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

        public static TaskWithVente from(TaskEntity task, VenteEntity vente) {
            TaskWithVente tw = new TaskWithVente();
            tw.taskId = task.id;
            tw.venteId = vente.id;
            tw.taskNom = task.nom;
            tw.taskStatus = task.status != null ? task.status.name() : null;
            tw.dateDebut = task.dateDebut != null ? task.dateDebut.toString() : null;
            tw.dateFin = task.dateFin != null ? task.dateFin.toString() : null;
            tw.statusDate = task.statusDate != null ? task.statusDate.toString() : null;
            tw.description = task.description;
            tw.notes = task.notes;
            tw.dureeEstimee = task.dureeEstimee;
            tw.dureeReelle = task.dureeReelle;
            tw.incidentDate = task.incidentDate != null ? task.incidentDate.toString() : null;
            tw.incidentDetails = task.incidentDetails;
            if (vente.client != null) {
                tw.clientNom = (vente.client.prenom != null ? vente.client.prenom + " " : "") + vente.client.nom;
            }
            tw.venteType = vente.type != null ? vente.type.name() : null;
            if (vente.bateau != null) {
                tw.bateauNom = vente.bateau.name;
            }
            return tw;
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

    @GET
    @Path("/techniciens/{id}/taches")
    public List<TaskWithVente> getTechnicienTasks(@PathParam("id") long technicienId) {
        TechnicienEntity technicien = TechnicienEntity.findById(technicienId);
        if (technicien == null) {
            throw new WebApplicationException("Technicien non trouve", Response.Status.NOT_FOUND);
        }

        List<VenteEntity> ventes = VenteEntity.listAll();
        List<TaskWithVente> result = new ArrayList<>();
        for (VenteEntity vente : ventes) {
            if (vente.taches == null) continue;
            for (TaskEntity task : vente.taches) {
                if (task.technicien != null && task.technicien.id.equals(technicienId)) {
                    result.add(TaskWithVente.from(task, vente));
                }
            }
        }
        return result;
    }

    @PUT
    @Path("/taches/{taskId}")
    @Transactional
    public TaskWithVente updateTask(@PathParam("taskId") long taskId, TaskUpdateRequest request) {
        TaskEntity task = TaskEntity.findById(taskId);
        if (task == null) {
            throw new WebApplicationException("Tache non trouvee", Response.Status.NOT_FOUND);
        }

        if (request.status != null && !request.status.isBlank()) {
            task.status = TaskEntity.Status.valueOf(request.status);
        }
        task.dureeReelle = request.dureeReelle;
        if (request.notes != null) {
            task.notes = request.notes;
        }

        if ("INCIDENT".equals(request.status)) {
            if (request.incidentDate != null && !request.incidentDate.isBlank()) {
                task.incidentDate = Date.valueOf(request.incidentDate);
            }
            task.incidentDetails = request.incidentDetails;
        }

        // Find the parent vente for the response
        List<VenteEntity> ventes = VenteEntity.list("SELECT v FROM VenteEntity v JOIN v.taches t WHERE t.id = ?1", taskId);
        VenteEntity parentVente = ventes.isEmpty() ? null : ventes.get(0);
        if (parentVente == null) {
            // fallback: return a minimal response
            TaskWithVente tw = new TaskWithVente();
            tw.taskId = task.id;
            tw.taskNom = task.nom;
            tw.taskStatus = task.status != null ? task.status.name() : null;
            tw.dureeReelle = task.dureeReelle;
            tw.incidentDate = task.incidentDate != null ? task.incidentDate.toString() : null;
            tw.incidentDetails = task.incidentDetails;
            tw.notes = task.notes;
            return tw;
        }
        return TaskWithVente.from(task, parentVente);
    }
}
