package net.nanthrax.moussaillon.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"type", "valeur"}))
public class ReferenceValeurEntity extends PanacheEntity {

    @Column(nullable = false)
    public String type;

    @Column(nullable = false)
    public String valeur;

    public int ordre;

}
