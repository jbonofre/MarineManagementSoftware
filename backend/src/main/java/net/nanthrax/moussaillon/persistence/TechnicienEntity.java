package net.nanthrax.moussaillon.persistence;

import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;

@Entity
public class TechnicienEntity extends PanacheEntity {

    public String nom;

    public String prenom;

    public String motDePasse;

    public String email;

    public String telephone;

    @ManyToMany
    public List<CompetenceEntity> competences;

    public String couleur;

}
