package net.nanthrax.moussaillon.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class FournisseurHeliceEntity extends PanacheEntity {

    @ManyToOne
    public FournisseurEntity fournisseur;

    @ManyToOne
    public HeliceCatalogueEntity helice;

    public double prixAchatHT;

    public double tva;
    
    public double montantTVA;

    public double prixAchatTTC;

    public double portForfaitaire;

    public double portParUnite;
    
    public int nombreMinACommander;

    public String notes;
}
