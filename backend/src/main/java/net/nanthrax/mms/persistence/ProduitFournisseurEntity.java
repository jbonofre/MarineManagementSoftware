package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;

@Entity
public class ProduitFournisseurEntity extends PanacheEntity {

    @OneToOne
    public ProduitCatalogueEntity produit;

    @OneToOne
    public FournisseurEntity fournisseur;

    public String reference;

    public double prixAchatHT;

    public double tva;

    public double montantTVA;

    public double prixAchatTTC;

    public double portForfaitaire;

    public double portParUnite;

    public int nombreMinACommander;

}
