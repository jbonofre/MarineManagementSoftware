package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;


@Entity
public class ClientEntity extends PanacheEntity {

    public String prenom;

    @Column(nullable = false)
    public String nom;

    @Column(nullable = false)
    public String type;

    public String email;

    public String adresse;

    public boolean consentement;

    public double evaluation;

    public String notes;

    public double remise;

    public String siren;

    public String siret;

    public String tva;

    public String naf;

}
