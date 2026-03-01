package net.nanthrax.moussaillon.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;

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

    @ManyToMany
    public List<ClientEntity> proprietaires = new ArrayList<>();

    @ManyToOne
    public BateauCatalogueEntity modele;

    public String localisation;

    public String localisationGps;

    @ManyToMany
    public List<MoteurCatalogueEntity> moteurs = new ArrayList<>();

    @ManyToMany
    public List<ProduitCatalogueEntity> equipements = new ArrayList<>();

}
