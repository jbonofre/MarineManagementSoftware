package net.nanthrax.mms.persistence;

import java.util.ArrayList;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Entity;

@Entity
public class HeliceCatalogueEntity extends PanacheEntity {

    @Column(nullable = false)
    public String modele;

    @Column(nullable = false)
    public String marque;

    public String description;

    public List<String> images = new ArrayList<>();

    public double evaluation;

    public double diametre;

    public String pas;

    public int pales;

    public int cannelures;

    @ManyToMany
    public List<MoteurCatalogueEntity> compatible = new ArrayList<>();

    public double prixPublic;   

    public double frais;

    public double tauxMarge;

    public double tauxMarque;

    public double prixVenteHT;

    public double tva;

    public double montantTVA;

    public double prixVenteTTC;
}
