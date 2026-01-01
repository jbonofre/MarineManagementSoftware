package net.nanthrax.mms.persistence;

import java.sql.Date;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class InterventionEtapeEntity extends PanacheEntity {
    
    @ManyToOne
    public TechnicienEntity technicien;

    public String notes;

    public String status;

    public Date statusDate;
}
