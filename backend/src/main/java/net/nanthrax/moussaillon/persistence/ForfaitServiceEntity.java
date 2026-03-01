package net.nanthrax.moussaillon.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class ForfaitServiceEntity extends PanacheEntity {

    @ManyToOne
    public ServiceEntity service;

    public int quantite;
}
