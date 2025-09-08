package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class HeliceEntity extends PanacheEntity {

    @Column(nullable = false)
    public String modele;

    @Column(nullable = false)
    public String marque;

    public String description;

    public double evaluation;

    public double diametre;

    public String pas;

    public int pales;

    public int cannelures;

    // public List<MoteurEntity> compatible = new ArrayList<>();

    public double prixVenteTTC;

}
