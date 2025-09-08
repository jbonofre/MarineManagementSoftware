package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class MoteurEntity extends PanacheEntity {

    @Column(nullable = false)
    public String modele;

    @Column(nullable = false)
    public String marque;

    @Column(nullable = false)
    public String type;

    public String notes;

    public double evaluation;

    public String image;

    public double puissanceCv;

    public double puissanceKw;

    public String longueurArbre;

    public double arbre;

    public String demarrage;

    public String barre;

    public int cylindres;

    public int cylindree;

    public String regime;

    public String huileRecommandee;

}
