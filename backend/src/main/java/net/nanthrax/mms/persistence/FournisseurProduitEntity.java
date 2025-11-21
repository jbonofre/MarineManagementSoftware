package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class FournisseurProduitEntity extends PanacheEntity {

    @ManyToOne
    public ProduitCatalogueEntity produit;

    @ManyToOne
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
