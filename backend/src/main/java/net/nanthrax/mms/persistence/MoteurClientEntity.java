package net.nanthrax.mms.persistence;

import java.util.ArrayList;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class MoteurClientEntity extends PanacheEntity {

    public List<String> images = new ArrayList<>();

    public String numeroSerie;

    public String dateMeS;

    public String dateAchat;

    public String dateFinDeGuarantie;

    @ManyToOne
    public ClientEntity proprietaire;

    @ManyToOne
    public MoteurCatalogueEntity modele;
    
}
