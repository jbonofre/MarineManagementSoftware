package net.nanthrax.moussaillon.persistence;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.json.bind.annotation.JsonbTypeAdapter;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class AnnonceEntity extends PanacheEntity {

    public enum Status {
        ACTIVE,
        VENDU,
        EXPIRE
    }

    public Status status = Status.ACTIVE;

    public String titre;

    public String description;

    public double prix;

    public String contact;

    public String telephone;

    public List<String> photos = new ArrayList<>();

    public List<String> publications = new ArrayList<>();

    @JsonbTypeAdapter(TimestampJsonbAdapter.class)
    public Timestamp dateCreation;

    @ManyToOne
    public ClientEntity client;

    @ManyToOne
    public BateauClientEntity bateau;

}
