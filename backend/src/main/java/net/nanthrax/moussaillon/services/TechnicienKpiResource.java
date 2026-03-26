package net.nanthrax.moussaillon.services;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import net.nanthrax.moussaillon.persistence.TechnicienEntity;
import net.nanthrax.moussaillon.persistence.VenteForfaitEntity;
import net.nanthrax.moussaillon.persistence.VenteServiceEntity;

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

        List<VenteForfaitEntity> allForfaits = VenteForfaitEntity.list("technicien.id = ?1", id);
        List<VenteServiceEntity> allServices = VenteServiceEntity.list("technicien.id = ?1", id);

        // Combine into a unified list of status/dates/dureeReelle
        List<PlanningItem> allItems = new ArrayList<>();
        for (VenteForfaitEntity vf : allForfaits) {
            allItems.add(new PlanningItem(
                    vf.status != null ? vf.status.name() : null,
                    vf.dateDebut, vf.dureeReelle));
        }
        for (VenteServiceEntity vs : allServices) {
            allItems.add(new PlanningItem(
                    vs.status != null ? vs.status.name() : null,
                    vs.dateDebut, vs.dureeReelle));
        }

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        Timestamp monthStart = Timestamp.valueOf(startOfMonth.atStartOfDay());

        TechnicienKpi kpi = new TechnicienKpi();

        kpi.totalTaches = allItems.size();
        kpi.tachesTerminees = (int) allItems.stream().filter(i -> "TERMINEE".equals(i.status)).count();
        kpi.tachesEnCours = (int) allItems.stream().filter(i -> "EN_COURS".equals(i.status)).count();
        kpi.tachesEnAttente = (int) allItems.stream().filter(i -> "EN_ATTENTE".equals(i.status) || "PLANIFIEE".equals(i.status)).count();
        kpi.tachesIncident = (int) allItems.stream().filter(i -> "INCIDENT".equals(i.status)).count();
        kpi.tachesAnnulees = (int) allItems.stream().filter(i -> "ANNULEE".equals(i.status)).count();

        kpi.tauxCompletion = kpi.totalTaches > 0 ? Math.round((double) kpi.tachesTerminees / kpi.totalTaches * 100.0 * 10) / 10.0 : 0;
        kpi.tauxIncident = kpi.totalTaches > 0 ? Math.round((double) kpi.tachesIncident / kpi.totalTaches * 100.0 * 10) / 10.0 : 0;

        kpi.heuresReelles = allItems.stream().filter(i -> "TERMINEE".equals(i.status)).mapToDouble(i -> i.dureeReelle).sum();

        // KPIs du mois
        List<PlanningItem> itemsDuMois = allItems.stream()
                .filter(i -> i.dateDebut != null && !i.dateDebut.before(monthStart))
                .toList();
        kpi.tachesMois = itemsDuMois.size();
        kpi.tachesTermineesMois = (int) itemsDuMois.stream().filter(i -> "TERMINEE".equals(i.status)).count();
        kpi.heuresReellesMois = itemsDuMois.stream().filter(i -> "TERMINEE".equals(i.status)).mapToDouble(i -> i.dureeReelle).sum();

        // Retards > 48h
        Timestamp twoDaysAgo = Timestamp.valueOf(now.minusDays(2).atStartOfDay());
        kpi.retards48h = (int) allItems.stream()
                .filter(i -> "EN_COURS".equals(i.status) && i.dateDebut != null && i.dateDebut.before(twoDaysAgo))
                .count();

        return kpi;
    }

    private record PlanningItem(String status, Timestamp dateDebut, double dureeReelle) {}

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
