package net.nanthrax.moussaillon.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

import java.sql.Timestamp;

@Entity
public class EmailSequenceHistoriqueEntity extends PanacheEntity {

    @ManyToOne
    public ClientEntity client;

    @ManyToOne
    public EmailSequenceEtapeEntity etape;

    public String destinataire;

    public String sujet;

    @Column(length = 10000)
    public String contenu;

    public Timestamp dateEnvoi;

    public static boolean dejaSent(long clientId, long etapeId) {
        return count("client.id = ?1 and etape.id = ?2", clientId, etapeId) > 0;
    }

}
