package net.nanthrax.moussaillon.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class FournisseurEntity extends PanacheEntity {

    @Column(nullable = false, unique = true)
    public String nom;

    public String image;

    public String email;

    public String telephone;

    public String adresse;

    public double evaluation;

    public String siren;

    public String siret;

    public String tva;

    public String naf;

    public String connexion;

}
