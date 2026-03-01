package net.nanthrax.moussaillon.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;

@Entity
public class CompetenceEntity extends PanacheEntity {

    public String nom;
    
    public String description;

    public String couleur;

}
