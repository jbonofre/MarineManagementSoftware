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
import net.nanthrax.moussaillon.persistence.PrestationEntity;
import net.nanthrax.moussaillon.persistence.TechnicienEntity;

@Path("/techniciens/{id}/kpi")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
public class TechnicienKpiResource {

    @GET
    public TechnicienKpi get(@PathParam("id") long id) {
        TechnicienEntity technicien = TechnicienEntity.findById(id);
        if (technicien == null) {
            throw new WebApplicationException("Le technicien (" + id + ") n'est pas trouve", 404);
        }

        List<PrestationEntity> allPrestations = PrestationEntity.list("technicien.id = ?1", id);

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        Date monthStart = Date.valueOf(startOfMonth);

        TechnicienKpi kpi = new TechnicienKpi();

        kpi.totalPrestations = allPrestations.size();
        kpi.prestationsTerminees = (int) allPrestations.stream().filter(p -> p.status == PrestationEntity.Status.TERMINEE).count();
        kpi.prestationsEnCours = (int) allPrestations.stream().filter(p -> p.status == PrestationEntity.Status.EN_COURS).count();
        kpi.prestationsEnAttente = (int) allPrestations.stream().filter(p -> p.status == PrestationEntity.Status.EN_ATTENTE || p.status == PrestationEntity.Status.PLANIFIEE).count();
        kpi.prestationsIncident = (int) allPrestations.stream().filter(p -> p.status == PrestationEntity.Status.INCIDENT).count();
        kpi.prestationsAnnulees = (int) allPrestations.stream().filter(p -> p.status == PrestationEntity.Status.ANNULEE).count();

        kpi.tauxCompletion = kpi.totalPrestations > 0 ? Math.round((double) kpi.prestationsTerminees / kpi.totalPrestations * 100.0 * 10) / 10.0 : 0;
        kpi.tauxIncident = kpi.totalPrestations > 0 ? Math.round((double) kpi.prestationsIncident / kpi.totalPrestations * 100.0 * 10) / 10.0 : 0;

        kpi.heuresEstimees = allPrestations.stream().mapToDouble(p -> p.dureeEstimee).sum();
        kpi.heuresReelles = allPrestations.stream().filter(p -> p.status == PrestationEntity.Status.TERMINEE).mapToDouble(p -> p.dureeReelle).sum();
        kpi.efficacite = kpi.heuresEstimees > 0 ? Math.round(kpi.heuresReelles / kpi.heuresEstimees * 100.0 * 10) / 10.0 : 0;

        // KPIs du mois
        List<PrestationEntity> prestationsDuMois = allPrestations.stream()
                .filter(p -> p.dateDebut != null && !p.dateDebut.before(monthStart))
                .toList();
        kpi.prestationsMois = prestationsDuMois.size();
        kpi.prestationsTermineesMois = (int) prestationsDuMois.stream().filter(p -> p.status == PrestationEntity.Status.TERMINEE).count();
        kpi.heuresReellesMois = prestationsDuMois.stream().filter(p -> p.status == PrestationEntity.Status.TERMINEE).mapToDouble(p -> p.dureeReelle).sum();

        // Retards > 48h
        Date twoDaysAgo = Date.valueOf(now.minusDays(2));
        kpi.retards48h = (int) allPrestations.stream()
                .filter(p -> p.status == PrestationEntity.Status.EN_COURS && p.dateDebut != null && p.dateDebut.before(twoDaysAgo))
                .count();

        return kpi;
    }

    public static class TechnicienKpi {
        public int totalPrestations;
        public int prestationsTerminees;
        public int prestationsEnCours;
        public int prestationsEnAttente;
        public int prestationsIncident;
        public int prestationsAnnulees;
        public double tauxCompletion;
        public double tauxIncident;
        public double heuresEstimees;
        public double heuresReelles;
        public double efficacite;
        public int prestationsMois;
        public int prestationsTermineesMois;
        public double heuresReellesMois;
        public int retards48h;
    }

}
