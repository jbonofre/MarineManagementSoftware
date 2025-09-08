package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import java.util.ArrayList;
import java.util.List;

@Entity
public class BateauEntity extends PanacheEntity {

    public String name;

    public String image;

    public List<String> images = new ArrayList<>();

    public String immatriculation;

    public String numeroSerie;

    public String numeroClef;

    public String marque;

    public String modele;

    @Column(nullable = false)
    public String type;

    public String dateMeS;

    public String dateAchat;

    public String dateFinDeGuarantie;

    public ClientEntity proprietaire;

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

    public String assureur;

    public String numeroAssurance;

    public String localisation;

    public String localisationGps;

    // moteurs

    // electronique

    // equipement

    // remorque

}
