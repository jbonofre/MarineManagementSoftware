package net.nanthrax.moussaillon.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class ServiceMainOeuvreEntity extends PanacheEntity {

    @ManyToOne
    public MainOeuvreEntity mainOeuvre;

    public double quantite;
}
