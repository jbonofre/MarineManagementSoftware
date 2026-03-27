package net.nanthrax.moussaillon.persistence;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.json.bind.annotation.JsonbTypeAdapter;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class VenteEntity extends PanacheEntity {

    public enum Status {
        EN_ATTENTE,
        EN_COURS,
        PAYEE,
        ANNULEE
    }

    public Status status;

    public enum Type {
        DEVIS,
        COMMANDE,
        FACTURE,
        LIVRAISON,
        COMPTOIR,
    }

    public Type type;

    @ManyToOne
    public ClientEntity client;

    @ManyToOne
    public BateauClientEntity bateau;

    @ManyToOne
    public MoteurClientEntity moteur;

    @ManyToOne
    public RemorqueClientEntity remorque;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = jakarta.persistence.FetchType.EAGER)
    @JoinColumn(name = "vente_id")
    public List<VenteForfaitEntity> venteForfaits = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = jakarta.persistence.FetchType.EAGER)
    @JoinColumn(name = "vente_id")
    public List<VenteServiceEntity> venteServices = new ArrayList<>();

    @ManyToMany
    public List<ProduitCatalogueEntity> produits;

    @JsonbTypeAdapter(TimestampJsonbAdapter.class)
    public Timestamp date;

    public double montantHT;

    public double remise;

    public double montantTTC;

    public double tva;

    public double montantTVA;

    public double prixVenteTTC;

    public enum ModePaiement {
        CHEQUE,
        VIREMENT,
        CARTE,
        ESPÈCES,
    }

    public ModePaiement modePaiement;

    public boolean stockDecremented;

    // Configuration des rappels (en jours avant la date de la vente)
    public Integer rappel1Jours;
    public Integer rappel2Jours;
    public Integer rappel3Jours;

    // Suivi des rappels envoyes
    public boolean rappel1Envoye;
    public boolean rappel2Envoye;
    public boolean rappel3Envoye;

}
