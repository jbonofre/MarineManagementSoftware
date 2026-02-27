package net.nanthrax.mms.persistence;

import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;

@Entity
public class TechnicienEntity extends PanacheEntity {

    public String nom;

    public String prenom;

    public String motDePasse;

    public String email;

    public String telephone;

    public List<String> competences;

    public String couleur;

}
