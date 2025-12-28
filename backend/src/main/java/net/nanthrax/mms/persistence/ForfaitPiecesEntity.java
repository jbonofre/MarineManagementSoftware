package net.nanthrax.mms.persistence;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class ForfaitPiecesEntity extends PanacheEntity {

    @ManyToOne
    public ForfaitEntity forfait;

    @ManyToOne
    public ProduitCatalogueEntity produit;

    public int quantite;
    
}
