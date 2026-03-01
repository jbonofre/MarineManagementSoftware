package net.nanthrax.moussaillon.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class FournisseurBateauEntity extends PanacheEntity {

    @ManyToOne
    public FournisseurEntity fournisseur;

    @ManyToOne
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
