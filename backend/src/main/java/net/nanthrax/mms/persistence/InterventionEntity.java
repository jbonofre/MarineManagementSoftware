package net.nanthrax.mms.persistence;

import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;

@Entity
public class InterventionEntity extends PanacheEntity {

    @ManyToOne
    public ClientEntity client;
    @ManyToOne
    public BateauClientEntity bateau;
    @ManyToOne
    public MoteurClientEntity moteur;

    @ManyToMany
    public List<ForfaitEntity> forfaits;
    @ManyToMany
    public List<ForfaitPiecesEntity> pieces;

    public String status;
    // intervenant
    
}
