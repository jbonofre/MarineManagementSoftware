package net.nanthrax.moussaillon.services;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import net.nanthrax.moussaillon.persistence.TaskEntity;
import net.nanthrax.moussaillon.persistence.TechnicienEntity;

@Path("/techniciens/{id}/kpi")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
public class TechnicienKpiResource {

    @GET
    public TechnicienKpi get(@PathParam("id") long id) {
        TechnicienEntity technicien = TechnicienEntity.findById(id);
        if (technicien == null) {
            throw new WebApplicationException("Le technicien (" + id + ") n'est pas trouvé", 404);
        }

        List<TaskEntity> allTasks = TaskEntity.list("technicien.id = ?1", id);

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        Date monthStart = Date.valueOf(startOfMonth);

        TechnicienKpi kpi = new TechnicienKpi();

        kpi.totalTaches = allTasks.size();
        kpi.tachesTerminees = (int) allTasks.stream().filter(t -> t.status == TaskEntity.Status.TERMINEE).count();
        kpi.tachesEnCours = (int) allTasks.stream().filter(t -> t.status == TaskEntity.Status.EN_COURS).count();
        kpi.tachesEnAttente = (int) allTasks.stream().filter(t -> t.status == TaskEntity.Status.EN_ATTENTE || t.status == TaskEntity.Status.PLANIFIEE).count();
        kpi.tachesIncident = (int) allTasks.stream().filter(t -> t.status == TaskEntity.Status.INCIDENT).count();
        kpi.tachesAnnulees = (int) allTasks.stream().filter(t -> t.status == TaskEntity.Status.ANNULEE).count();

        kpi.tauxCompletion = kpi.totalTaches > 0 ? Math.round((double) kpi.tachesTerminees / kpi.totalTaches * 100.0 * 10) / 10.0 : 0;
        kpi.tauxIncident = kpi.totalTaches > 0 ? Math.round((double) kpi.tachesIncident / kpi.totalTaches * 100.0 * 10) / 10.0 : 0;

        kpi.heuresReelles = allTasks.stream().filter(t -> t.status == TaskEntity.Status.TERMINEE).mapToDouble(t -> t.dureeReelle).sum();

        // KPIs du mois
        List<TaskEntity> tachesDuMois = allTasks.stream()
                .filter(t -> t.dateDebut != null && !t.dateDebut.before(monthStart))
                .toList();
        kpi.tachesMois = tachesDuMois.size();
        kpi.tachesTermineesMois = (int) tachesDuMois.stream().filter(t -> t.status == TaskEntity.Status.TERMINEE).count();
        kpi.heuresReellesMois = tachesDuMois.stream().filter(t -> t.status == TaskEntity.Status.TERMINEE).mapToDouble(t -> t.dureeReelle).sum();

        // Retards > 48h
        Date twoDaysAgo = Date.valueOf(now.minusDays(2));
        kpi.retards48h = (int) allTasks.stream()
                .filter(t -> t.status == TaskEntity.Status.EN_COURS && t.dateDebut != null && t.dateDebut.before(twoDaysAgo))
                .count();

        return kpi;
    }

    public static class TechnicienKpi {
        public int totalTaches;
        public int tachesTerminees;
        public int tachesEnCours;
        public int tachesEnAttente;
        public int tachesIncident;
        public int tachesAnnulees;
        public double tauxCompletion;
        public double tauxIncident;
        public double heuresReelles;
        public int tachesMois;
        public int tachesTermineesMois;
        public double heuresReellesMois;
        public int retards48h;
    }

}
