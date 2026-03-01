package net.nanthrax.moussaillon.persistence;

import java.sql.Date;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;

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
    
    public Date date;
    
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
    
}
