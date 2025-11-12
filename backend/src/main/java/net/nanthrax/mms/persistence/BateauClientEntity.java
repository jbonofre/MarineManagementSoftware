package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

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

    @OneToOne
    public ClientEntity proprietaire;

    @OneToOne
    public BateauCatalogueEntity bateau;

    public String categorieCe;

    public String assureur;

    public String numeroAssurance;

    public String localisation;

    public String localisationGps;

    @ManyToOne
    public List<MoteurCatalogueEntity> moteurs = new ArrayList<>();

    @OneToOne
    public RemorqueCatalogueEntity remorque;

    @ManyToOne
    public List<ProduitCatalogueEntity> equipements = new ArrayList<>();

}
