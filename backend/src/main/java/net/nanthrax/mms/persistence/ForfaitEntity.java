package net.nanthrax.mms.persistence;

import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;

@Entity
public class ForfaitEntity extends PanacheEntity {

    public String nom;

    @ManyToMany
    public List<MoteurCatalogueEntity> moteurs;
    @ManyToMany
    public List<BateauCatalogueEntity> bateaux;
    
    public long heuresFonctionnement;
    public long joursFrequence;

    // TODO ajouter les services et produits associés au forfait

    public List<String> competences;

    public double prixHT;

    public double tva;

    public double montantTVA;

    public double prixTTC;

}
