package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class UserEntity extends PanacheEntityBase {

    @Id
    public String name;

    public String roles;
    public String password;
    public String email;

}
