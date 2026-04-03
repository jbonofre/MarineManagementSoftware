package net.nanthrax.moussaillon.services;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.moussaillon.persistence.BateauClientEntity;
import net.nanthrax.moussaillon.persistence.CampagneEntity;
import net.nanthrax.moussaillon.persistence.ClientEntity;
import net.nanthrax.moussaillon.persistence.FournisseurEntity;
import net.nanthrax.moussaillon.persistence.MoteurClientEntity;
import net.nanthrax.moussaillon.persistence.RemorqueClientEntity;

@Path("/campagnes")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CampagneResource {

    @Inject
    Mailer mailer;

    @GET
    public List<CampagneEntity> getAll() {
        return CampagneEntity.listAll();
    }

    @GET
    @Path("/{id}")
    public CampagneEntity get(@PathParam("id") long id) {
        CampagneEntity entity = CampagneEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Campagne non trouvee", Response.Status.NOT_FOUND);
        }
        return entity;
    }

    @POST
    @Transactional
    public CampagneEntity create(CampagneEntity campagne) {
        campagne.dateCreation = new Timestamp(System.currentTimeMillis());
        if (campagne.statut == null) {
            campagne.statut = CampagneEntity.Statut.BROUILLON;
        }
        campagne.persist();
        return campagne;
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public CampagneEntity update(@PathParam("id") long id, CampagneEntity campagne) {
        CampagneEntity entity = CampagneEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Campagne non trouvee", Response.Status.NOT_FOUND);
        }
        if (entity.statut == CampagneEntity.Statut.ENVOYEE) {
            throw new WebApplicationException("Une campagne envoyee ne peut pas etre modifiee", Response.Status.BAD_REQUEST);
        }
        entity.nom = campagne.nom;
        entity.canal = campagne.canal;
        entity.cible = campagne.cible;
        entity.sujet = campagne.sujet;
        entity.contenu = campagne.contenu;
        return entity;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public void delete(@PathParam("id") long id) {
        CampagneEntity entity = CampagneEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Campagne non trouvee", Response.Status.NOT_FOUND);
        }
        entity.delete();
    }

    @GET
    @Path("/{id}/destinataires")
    public List<Destinataire> getDestinataires(@PathParam("id") long id) {
        CampagneEntity entity = CampagneEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Campagne non trouvee", Response.Status.NOT_FOUND);
        }
        return resolveDestinataires(entity.cible, entity.canal);
    }

    @POST
    @Path("/{id}/envoyer")
    @Transactional
    public CampagneEntity envoyer(@PathParam("id") long id) {
        CampagneEntity entity = CampagneEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Campagne non trouvee", Response.Status.NOT_FOUND);
        }
        if (entity.statut == CampagneEntity.Statut.ENVOYEE) {
            throw new WebApplicationException("Campagne deja envoyee", Response.Status.BAD_REQUEST);
        }

        List<Destinataire> destinataires = resolveDestinataires(entity.cible, entity.canal);

        if (destinataires.isEmpty()) {
            throw new WebApplicationException("Aucun destinataire trouve pour les criteres selectionnes", Response.Status.BAD_REQUEST);
        }

        if (entity.canal == CampagneEntity.Canal.EMAIL) {
            for (Destinataire dest : destinataires) {
                mailer.send(Mail.withHtml(dest.email, entity.sujet, entity.contenu));
            }
        }
        // SMS: not implemented yet (requires SMS gateway)

        entity.nombreDestinataires = destinataires.size();
        entity.dateEnvoi = new Timestamp(System.currentTimeMillis());
        entity.statut = CampagneEntity.Statut.ENVOYEE;
        return entity;
    }

    private List<Destinataire> resolveDestinataires(CampagneEntity.Cible cible, CampagneEntity.Canal canal) {
        Set<Destinataire> result = new HashSet<>();

        if (cible == CampagneEntity.Cible.FOURNISSEUR) {
            List<FournisseurEntity> fournisseurs = FournisseurEntity.listAll();
            for (FournisseurEntity f : fournisseurs) {
                String contact = canal == CampagneEntity.Canal.EMAIL ? f.email : f.telephone;
                if (contact != null && !contact.isBlank()) {
                    result.add(new Destinataire(f.nom, contact));
                }
            }
        } else {
            Set<Long> clientIds = new HashSet<>();

            if (cible == CampagneEntity.Cible.PROPRIETAIRE_BATEAU) {
                List<BateauClientEntity> bateaux = BateauClientEntity.listAll();
                for (BateauClientEntity b : bateaux) {
                    for (ClientEntity c : b.proprietaires) {
                        clientIds.add(c.id);
                    }
                }
            } else if (cible == CampagneEntity.Cible.PROPRIETAIRE_MOTEUR) {
                List<MoteurClientEntity> moteurs = MoteurClientEntity.listAll();
                for (MoteurClientEntity m : moteurs) {
                    if (m.proprietaire != null) {
                        clientIds.add(m.proprietaire.id);
                    }
                }
            } else if (cible == CampagneEntity.Cible.PROPRIETAIRE_REMORQUE) {
                List<RemorqueClientEntity> remorques = RemorqueClientEntity.listAll();
                for (RemorqueClientEntity r : remorques) {
                    if (r.proprietaire != null) {
                        clientIds.add(r.proprietaire.id);
                    }
                }
            }

            for (Long clientId : clientIds) {
                ClientEntity client = ClientEntity.findById(clientId);
                if (client != null) {
                    String contact = canal == CampagneEntity.Canal.EMAIL ? client.email : client.telephone;
                    if (contact != null && !contact.isBlank()) {
                        String nom = ((client.prenom != null ? client.prenom + " " : "") + client.nom).trim();
                        result.add(new Destinataire(nom, contact));
                    }
                }
            }
        }

        return new ArrayList<>(result);
    }

    public static class Destinataire {
        public String nom;
        public String email;

        public Destinataire() {}

        public Destinataire(String nom, String email) {
            this.nom = nom;
            this.email = email;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Destinataire that = (Destinataire) o;
            return email != null && email.equals(that.email);
        }

        @Override
        public int hashCode() {
            return email != null ? email.hashCode() : 0;
        }
    }

}
