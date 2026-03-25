package net.nanthrax.moussaillon.persistence;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.json.bind.annotation.JsonbTypeAdapter;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class PrestationEntity extends PanacheEntity {

    public String nom;

    public enum Status {
        EN_ATTENTE,
        PLANIFIEE,
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

    public Date incidentDate;

    public String incidentDetails;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "prestation_id")
    public List<PrestationTaskEntity> taches = new ArrayList<>();

}
