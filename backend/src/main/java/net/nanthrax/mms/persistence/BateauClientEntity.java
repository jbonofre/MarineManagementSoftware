package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;

import java.util.ArrayList;
import java.util.List;

@Entity
public class BateauClientEntity extends PanacheEntity {

    public String name;

    public List<String> images = new ArrayList<>();

    public String immatriculation;

    public String numeroSerie;

    public String numeroClef;

    public String dateMeS;

    public String dateAchat;

    public String dateFinDeGuarantie;

    // public ClientEntity proprietaire;

    // public BateauCatalogueEntity bateau;

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
