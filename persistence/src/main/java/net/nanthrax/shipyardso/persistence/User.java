package net.nanthrax.shipyardso.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;

@Entity
public class User extends PanacheEntity {

    public String userId;
    public String name;
    public String email;

}
