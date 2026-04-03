package net.nanthrax.moussaillon.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import java.util.List;

@Entity
public class EmailSequenceEtapeEntity extends PanacheEntity {

    @Column(nullable = false)
    public int ordre;

    @Column(nullable = false)
    public int delaiJours;

    @Column(nullable = false)
    public String sujet;

    @Column(nullable = false, length = 10000)
    public String contenu;

    public String description;

    public boolean actif = true;

    public static List<EmailSequenceEtapeEntity> listActives() {
        return list("actif = true order by ordre");
    }

    public static List<EmailSequenceEtapeEntity> listAllOrdered() {
        return list("order by ordre");
    }

}
