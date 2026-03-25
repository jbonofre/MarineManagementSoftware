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
import net.nanthrax.moussaillon.persistence.PrestationEntity;
import net.nanthrax.moussaillon.persistence.ProduitCatalogueEntity;
import net.nanthrax.moussaillon.persistence.VenteEntity;

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

        // CA du mois: sum of prixVenteTTC for PAYEE ventes this month
        List<VenteEntity> ventesDuMois = VenteEntity.list("status = ?1 and date >= ?2", VenteEntity.Status.PAYEE, monthStart);
        data.caDuMois = ventesDuMois.stream().mapToDouble(v -> v.prixVenteTTC).sum();

        // Interventions ouvertes
        data.interventionsOuvertes = (int) PrestationEntity.count("status in (?1, ?2)", PrestationEntity.Status.EN_ATTENTE, PrestationEntity.Status.EN_COURS);

        // Retards > 48h: prestations EN_COURS started more than 48h ago
        data.retards48h = (int) PrestationEntity.count("status = ?1 and dateDebut < ?2", PrestationEntity.Status.EN_COURS, Date.valueOf(now.minusDays(2)));

        // Alertes stock: products where stock <= stockMini
        List<ProduitCatalogueEntity> produitsEnAlerte = ProduitCatalogueEntity.list("stock <= stockMini");
        data.alertesStock = produitsEnAlerte.size();

        // Interventions du jour: prestations starting today
        Date today = Date.valueOf(now);
        List<VenteEntity> ventesAvecPrestations = VenteEntity.list(
                "select v from VenteEntity v join v.prestations p where p.dateDebut = ?1", today);

        data.interventions = new ArrayList<>();
        for (VenteEntity vente : ventesAvecPrestations) {
            for (PrestationEntity prestation : vente.prestations) {
                if (prestation.dateDebut != null && prestation.dateDebut.equals(today)) {
                    InterventionRow row = new InterventionRow();
                    row.key = String.valueOf(prestation.id);
                    row.client = vente.client != null
                            ? (vente.client.prenom != null ? vente.client.prenom + " " : "") + vente.client.nom
                            : "";
                    row.unite = vente.bateau != null ? vente.bateau.name : (vente.moteur != null ? "Moteur" : "");
                    row.type = prestation.nom != null ? prestation.nom : "";
                    row.technicien = prestation.technicien != null
                            ? (prestation.technicien.prenom != null ? prestation.technicien.prenom.substring(0, 1) + ". " : "") + prestation.technicien.nom
                            : "";
                    row.statut = mapStatut(prestation.status);
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
        // Heures atelier facturees: ratio dureeReelle / dureeEstimee for prestations this month
        List<PrestationEntity> prestationsDuMois = PrestationEntity.list("dateDebut >= ?1", Date.valueOf(startOfMonth));
        double totalEstimee = prestationsDuMois.stream().mapToDouble(p -> p.dureeEstimee).sum();
        double totalReelle = prestationsDuMois.stream().filter(p -> p.status == PrestationEntity.Status.TERMINEE).mapToDouble(p -> p.dureeReelle).sum();
        data.heuresAtelierPct = totalEstimee > 0 ? (int) Math.round(totalReelle / totalEstimee * 100) : 0;

        // Ventes comptoir: ratio of PAYEE comptoir sales vs total comptoir sales this month
        long comptoirTotal = VenteEntity.count("type = ?1 and date >= ?2", VenteEntity.Type.COMPTOIR, monthStart);
        long comptoirPayees = VenteEntity.count("type = ?1 and status = ?2 and date >= ?3", VenteEntity.Type.COMPTOIR, VenteEntity.Status.PAYEE, monthStart);
        data.ventesComptoirPct = comptoirTotal > 0 ? (int) Math.round((double) comptoirPayees / comptoirTotal * 100) : 0;

        // Contrats de maintenance: ratio of completed prestations vs total prestations this month
        long prestationsTotal = prestationsDuMois.size();
        long prestationsTerminees = prestationsDuMois.stream().filter(p -> p.status == PrestationEntity.Status.TERMINEE).count();
        data.contratsMaintenancePct = prestationsTotal > 0 ? (int) Math.round((double) prestationsTerminees / prestationsTotal * 100) : 0;

        return data;
    }

    private String mapStatut(PrestationEntity.Status status) {
        if (status == null) return "A faire";
        return switch (status) {
            case PLANIFIEE -> "Planifiee";
            case EN_COURS -> "En cours";
            case TERMINEE -> "Terminee";
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
