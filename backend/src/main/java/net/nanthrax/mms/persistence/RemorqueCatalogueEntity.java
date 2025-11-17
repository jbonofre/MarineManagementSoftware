package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class RemorqueCatalogueEntity extends PanacheEntity {

    @Column(nullable = false)
    public String modele;

    @Column(nullable = false)
    public String marque;

    public String description;

    public int evaluation;

    public long ptac;

    public long chargeAVide;

    public long chargeUtile;

    public long longueur;

    public long largeur;

    public long longueurMaxBateau;

    public long largeurMaxBateau;

    public String fleche;

    public String typeChassis;

    public String roues;

    public String equipement;

    public long stock;

    public long stockAlerte;

    public String emplacement;

    public double prixPublic;

    public double frais;

    public double tauxMarge;

    public double tauxMarque;

    public double prixVenteHT;

    public double tva;

    public double montantTVA;

    public double prixVenteTTC;

}

