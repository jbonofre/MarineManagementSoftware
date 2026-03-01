package net.nanthrax.moussaillon.persistence;

import java.util.List;
import java.util.ArrayList;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.JoinColumn;

@Entity
public class ForfaitEntity extends PanacheEntity {

    public String nom;

    @ManyToMany
    public List<MoteurCatalogueEntity> moteursAssocies;
    @ManyToMany
    public List<BateauCatalogueEntity> bateauxAssocies;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "forfait_id")
    public List<ForfaitProduitEntity> produits = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "forfait_id")
    public List<ForfaitServiceEntity> services = new ArrayList<>();
    
    public long heuresFonctionnement;
    public long joursFrequence;

    @ManyToMany
    public List<CompetenceEntity> competences;

    public double prixHT;

    public double tva;

    public double montantTVA;

    public double prixTTC;

    public String reference;

}
