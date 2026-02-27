package net.nanthrax.mms.persistence;

import java.util.ArrayList;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;

@Entity
public class ServiceEntity extends PanacheEntity {

    public String nom;

    public String description;

    public double prixHT;

    public double tva;

    public double montantTVA;

    public double prixTTC;

    @ManyToMany
    public List<CompetenceEntity> competences = new ArrayList<>();
    
}
