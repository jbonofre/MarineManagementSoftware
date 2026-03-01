package net.nanthrax.moussaillon.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class UserEntity extends PanacheEntityBase {

    @Id
    public String name;

    @Column(nullable = false)
    public String roles;

    @Column(nullable = false)
    public String password;

    @Column(nullable = false)
    public String email;

}
