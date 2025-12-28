package net.nanthrax.mms.persistence;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;

@Entity
public class TransactionEntity extends PanacheEntity {

    public String status;

    public Date dateStatus;

    public Date dateCreation;

    public Date dateLivraison;

    public Date datePaiement;

    public Date dateEcheance;

    public long montantHT;

    public long remise;

    @ManyToOne
    public ClientEntity client;

    @ManyToMany
    public List<ProduitCatalogueEntity> articles = new ArrayList<>();

    @ManyToMany
    public List<BateauClientEntity> bateaux = new ArrayList<>();

    @ManyToMany
    public List<MoteurClientEntity> moteurs = new ArrayList<>();
    
}
