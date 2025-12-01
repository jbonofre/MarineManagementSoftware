package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

import java.util.ArrayList;
import java.util.List;

@Entity
public class RemorqueClientEntity extends PanacheEntity {

    public String immatriculation;

    public String dateMeS;

    public String dateAchat;

    public String dateFinDeGuarantie;

    public List<String> images = new ArrayList<>();

    @ManyToOne
    public ClientEntity proprietaire;

    @ManyToOne
    public RemorqueCatalogueEntity modele;

}