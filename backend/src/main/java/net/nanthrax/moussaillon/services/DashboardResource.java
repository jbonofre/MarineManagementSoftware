package net.nanthrax.moussaillon.services;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import net.nanthrax.moussaillon.persistence.ProduitCatalogueEntity;
import net.nanthrax.moussaillon.persistence.VenteEntity;
import net.nanthrax.moussaillon.persistence.VenteForfaitEntity;
import net.nanthrax.moussaillon.persistence.VenteServiceEntity;

@Path("/dashboard")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
public class DashboardResource {

    @GET
    public DashboardData get() {
        DashboardData data = new DashboardData();

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        Timestamp monthStart = Timestamp.valueOf(startOfMonth.atStartOfDay());
        Date today = Date.valueOf(now);
        Date monthStartDate = Date.valueOf(startOfMonth);

        // CA du mois: sum of prixVenteTTC for PAYEE ventes this month
        List<VenteEntity> ventesDuMois = VenteEntity.list("status = ?1 and date >= ?2", VenteEntity.Status.PAYEE, monthStart);
        data.caDuMois = ventesDuMois.stream().mapToDouble(v -> v.prixVenteTTC).sum();

        // Interventions ouvertes (forfaits + services EN_ATTENTE or EN_COURS)
        long forfaitsOuverts = VenteForfaitEntity.count("status in (?1, ?2)",
                VenteForfaitEntity.Status.EN_ATTENTE, VenteForfaitEntity.Status.EN_COURS);
        long servicesOuverts = VenteServiceEntity.count("status in (?1, ?2)",
                VenteServiceEntity.Status.EN_ATTENTE, VenteServiceEntity.Status.EN_COURS);
        data.interventionsOuvertes = (int) (forfaitsOuverts + servicesOuverts);

        // Retards > 48h
        Date twoDaysAgo = Date.valueOf(now.minusDays(2));
        long forfaitsRetard = VenteForfaitEntity.count("status = ?1 and dateDebut < ?2",
                VenteForfaitEntity.Status.EN_COURS, twoDaysAgo);
        long servicesRetard = VenteServiceEntity.count("status = ?1 and dateDebut < ?2",
                VenteServiceEntity.Status.EN_COURS, twoDaysAgo);
        data.retards48h = (int) (forfaitsRetard + servicesRetard);

        // Alertes stock
        List<ProduitCatalogueEntity> produitsEnAlerte = ProduitCatalogueEntity.list("stock <= stockMini");
        data.alertesStock = produitsEnAlerte.size();

        // Interventions du jour
        data.interventions = new ArrayList<>();
        List<VenteEntity> ventesAvecForfaits = VenteEntity.list(
                "select distinct v from VenteEntity v join v.venteForfaits vf where vf.dateDebut = ?1", today);
        for (VenteEntity vente : ventesAvecForfaits) {
            for (VenteForfaitEntity vf : vente.venteForfaits) {
                if (vf.dateDebut != null && vf.dateDebut.equals(today)) {
                    InterventionRow row = new InterventionRow();
                    row.key = "f-" + vf.id;
                    row.client = vente.client != null
                            ? (vente.client.prenom != null ? vente.client.prenom + " " : "") + vente.client.nom
                            : "";
                    row.unite = vente.bateau != null ? vente.bateau.name : (vente.moteur != null ? "Moteur" : "");
                    row.type = vf.forfait != null ? vf.forfait.nom : "";
                    row.technicien = vf.technicien != null
                            ? (vf.technicien.prenom != null ? vf.technicien.prenom.substring(0, 1) + ". " : "") + vf.technicien.nom
                            : "";
                    row.statut = mapStatut(vf.status != null ? vf.status.name() : null);
                    data.interventions.add(row);
                }
            }
        }
        List<VenteEntity> ventesAvecServices = VenteEntity.list(
                "select distinct v from VenteEntity v join v.venteServices vs where vs.dateDebut = ?1", today);
        for (VenteEntity vente : ventesAvecServices) {
            for (VenteServiceEntity vs : vente.venteServices) {
                if (vs.dateDebut != null && vs.dateDebut.equals(today)) {
                    InterventionRow row = new InterventionRow();
                    row.key = "s-" + vs.id;
                    row.client = vente.client != null
                            ? (vente.client.prenom != null ? vente.client.prenom + " " : "") + vente.client.nom
                            : "";
                    row.unite = vente.bateau != null ? vente.bateau.name : (vente.moteur != null ? "Moteur" : "");
                    row.type = vs.service != null ? vs.service.nom : "";
                    row.technicien = vs.technicien != null
                            ? (vs.technicien.prenom != null ? vs.technicien.prenom.substring(0, 1) + ". " : "") + vs.technicien.nom
                            : "";
                    row.statut = mapStatut(vs.status != null ? vs.status.name() : null);
                    data.interventions.add(row);
                }
            }
        }

        // Stock a surveiller
        data.stockAlerts = new ArrayList<>();
        for (ProduitCatalogueEntity produit : produitsEnAlerte) {
            StockAlert alert = new StockAlert();
            alert.produit = produit.nom;
            alert.niveau = produit.stock == 0 ? "Critique" : "Bas";
            alert.color = produit.stock == 0 ? "red" : "orange";
            data.stockAlerts.add(alert);
        }

        // Objectifs mensuels
        List<VenteForfaitEntity> forfaitsDuMois = VenteForfaitEntity.list("dateDebut >= ?1", monthStartDate);
        List<VenteServiceEntity> servicesDuMois = VenteServiceEntity.list("dateDebut >= ?1", monthStartDate);
        double totalReelle = forfaitsDuMois.stream()
                .filter(vf -> vf.status == VenteForfaitEntity.Status.TERMINEE).mapToDouble(vf -> vf.dureeReelle).sum()
                + servicesDuMois.stream()
                .filter(vs -> vs.status == VenteServiceEntity.Status.TERMINEE).mapToDouble(vs -> vs.dureeReelle).sum();
        data.heuresAtelierPct = totalReelle > 0 ? (int) Math.min(100, Math.round(totalReelle)) : 0;

        // Ventes comptoir
        long comptoirTotal = VenteEntity.count("type = ?1 and date >= ?2", VenteEntity.Type.COMPTOIR, monthStart);
        long comptoirPayees = VenteEntity.count("type = ?1 and status = ?2 and date >= ?3", VenteEntity.Type.COMPTOIR, VenteEntity.Status.PAYEE, monthStart);
        data.ventesComptoirPct = comptoirTotal > 0 ? (int) Math.round((double) comptoirPayees / comptoirTotal * 100) : 0;

        // Contrats de maintenance
        long itemsTotal = forfaitsDuMois.size() + servicesDuMois.size();
        long itemsTermines = forfaitsDuMois.stream().filter(vf -> vf.status == VenteForfaitEntity.Status.TERMINEE).count()
                + servicesDuMois.stream().filter(vs -> vs.status == VenteServiceEntity.Status.TERMINEE).count();
        data.contratsMaintenancePct = itemsTotal > 0 ? (int) Math.round((double) itemsTermines / itemsTotal * 100) : 0;

        return data;
    }

    private String mapStatut(String status) {
        if (status == null) return "A faire";
        return switch (status) {
            case "PLANIFIEE" -> "Planifiee";
            case "EN_COURS" -> "En cours";
            case "TERMINEE" -> "Terminee";
            default -> "A faire";
        };
    }

    public static class DashboardData {
        public double caDuMois;
        public int interventionsOuvertes;
        public int retards48h;
        public int alertesStock;
        public List<InterventionRow> interventions;
        public List<StockAlert> stockAlerts;
        public int heuresAtelierPct;
        public int ventesComptoirPct;
        public int contratsMaintenancePct;
    }

    public static class InterventionRow {
        public String key;
        public String client;
        public String unite;
        public String type;
        public String technicien;
        public String statut;
    }

    public static class StockAlert {
        public String produit;
        public String niveau;
        public String color;
    }
}
