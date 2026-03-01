package net.nanthrax.moussaillon.persistence;

import java.sql.Date;
import java.sql.Timestamp;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.json.bind.annotation.JsonbTypeAdapter;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class TaskEntity extends PanacheEntity {

    public String nom;

    public enum Status {
        EN_ATTENTE,
        EN_COURS,
        TERMINEE,
        INCIDENT,
        ANNULEE
    }

    public Status status;
    
    public Date dateDebut;

    public Date dateFin;

    @JsonbTypeAdapter(TimestampJsonbAdapter.class)
    public Timestamp statusDate;

    public String description;
    
    public String notes;

    @ManyToOne
    public TechnicienEntity technicien;

    public double dureeEstimee;

    public double dureeReelle;

}
