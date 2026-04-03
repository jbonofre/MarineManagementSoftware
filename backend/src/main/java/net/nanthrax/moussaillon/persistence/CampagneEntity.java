package net.nanthrax.moussaillon.persistence;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.json.bind.annotation.JsonbTypeAdapter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
public class CampagneEntity extends PanacheEntity {

    public enum Canal {
        EMAIL,
        SMS
    }

    public enum Cible {
        PROPRIETAIRE_BATEAU,
        PROPRIETAIRE_MOTEUR,
        PROPRIETAIRE_REMORQUE,
        FOURNISSEUR
    }

    public enum Statut {
        BROUILLON,
        ENVOYEE
    }

    @Column(nullable = false)
    public String nom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Canal canal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Cible cible;

    @Enumerated(EnumType.STRING)
    public Statut statut = Statut.BROUILLON;

    public String sujet;

    @Column(length = 10000)
    public String contenu;

    public int nombreDestinataires;

    @JsonbTypeAdapter(TimestampJsonbAdapter.class)
    public Timestamp dateCreation;

    @JsonbTypeAdapter(TimestampJsonbAdapter.class)
    public Timestamp dateEnvoi;

}
