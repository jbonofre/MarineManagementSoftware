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

    @ManyToMany
    public List<ForfaitEntity> forfaits;

    @ManyToMany
    public List<ProduitCatalogueEntity> produits;

    @ManyToMany
    public List<ServiceEntity> services;
    
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
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "vente_id")
    public List<TaskEntity> taches = new ArrayList<TaskEntity>();

}
