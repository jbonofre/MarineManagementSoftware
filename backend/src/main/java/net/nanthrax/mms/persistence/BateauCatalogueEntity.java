package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import java.util.ArrayList;
import java.util.List;

@Entity
public class BateauCatalogueEntity extends PanacheEntity {

    @Column(nullable = false)
    public String modele;

    @Column(nullable = false)
    public String marque;

    public List<String> images = new ArrayList<>();

    @Column(nullable = false)
    public String type;

    public String description;

    public double longueurExterieure;

    public double longueurCoque;

    public double hauteur;

    public double largeur;

    public double tirantAir;

    public double tirantEau;

    public double poidsVide;

    public double poidsMoteurMax;

    public double chargeMax;

    public String longueurArbre;

    public String puissanceMax;

    public double reservoirEau;

    public double reservoirCarburant;

    public int nombrePassagersMax;

    public String categorieCe;

}