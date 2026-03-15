package net.nanthrax.moussaillon.persistence;

import java.sql.Timestamp;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.json.bind.annotation.JsonbTypeAdapter;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class RappelHistoriqueEntity extends PanacheEntity {

    @ManyToOne
    public VenteEntity vente;

    public int numeroRappel;

    public String destinataire;

    public String sujet;

    public String contenu;

    @JsonbTypeAdapter(TimestampJsonbAdapter.class)
    public Timestamp dateEnvoi;
}
