package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;

import java.sql.Date;

@Entity
public class ClientEntity extends PanacheEntity {

    public String prenom;

    public String nom;

    public String type;

    public String email;

    public String adresse;

    public boolean consentement;

    public Date date;

    public double evaluation;

    public String notes;

    public double remise;

    public String siren;

    public String siret;

    public String tva;

    public String naf;

}
