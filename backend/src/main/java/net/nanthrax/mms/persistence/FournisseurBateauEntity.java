package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;

@Entity
public class FournisseurBateauEntity extends PanacheEntity {

    @OneToOne
    public FournisseurEntity fournisseur;

    @OneToOne
    public BateauCatalogueEntity bateau;

    public double prixAchatHT;

    public double tva;
    
    public double montantTVA;

    public double prixAchatTTC;

    public double portForfaitaire;

    public double portParUnite;
    
    public int nombreMinACommander;

    public String notes;

}
