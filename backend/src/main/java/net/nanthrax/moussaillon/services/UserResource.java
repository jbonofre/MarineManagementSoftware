package net.nanthrax.moussaillon.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.moussaillon.persistence.UserEntity;

import java.util.List;

@Path("/users")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    public static class ChangePasswordRequest {
        public String currentPassword;
        public String newPassword;
    }

    @POST
    @Path("/authenticate")
    public Response authenticate(UserEntity user) {
        if (user == null || user.name == null || user.password == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Nom d'utilisateur et mot de passe requis.").build();
        }
        UserEntity entity = UserEntity.findById(user.name);
        if (entity == null || !entity.password.equals(user.password)) {
            return Response.status(Response.Status.UNAUTHORIZED).entity("Identifiants invalides.").build();
        }
        // You can return more data if needed (e.g., JWT token, user details, etc.)
        return Response.ok(entity).build();
    }

    @POST
    @Path("/{name}/change-password")
    @Transactional
    public Response changePassword(@PathParam("name") String name, ChangePasswordRequest request) {
        if (request == null || request.currentPassword == null || request.newPassword == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Mot de passe actuel et nouveau mot de passe requis.").build();
        }
        if (request.newPassword.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Le nouveau mot de passe ne peut pas être vide.").build();
        }

        UserEntity entity = UserEntity.findById(name);
        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("L'utilisateur " + name + " n'est pas trouvé").build();
        }
        if (!entity.password.equals(request.currentPassword)) {
            return Response.status(Response.Status.UNAUTHORIZED).entity("Mot de passe actuel invalide.").build();
        }

        entity.password = request.newPassword;
        return Response.noContent().build();
    }

    @GET
    @Path("/search")
    public List<UserEntity> search(@QueryParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return UserEntity.listAll();
        }
        String likeQuery = "%" + query.toLowerCase() + "%";
        return UserEntity.list("lower(name) like ?1 or lower(email) like ?1", likeQuery);
    }

    @GET
    public List<UserEntity> list() {
        return UserEntity.listAll();
    }

    @POST
    @Transactional
    public Response create(UserEntity user) {
        user.persist();
        return Response.ok(user).status(201).build();
    }

    @GET
    @Path("{name}")
    public UserEntity get(String name) {
        UserEntity entity = UserEntity.findById(name);
        if (entity == null) {
            throw new WebApplicationException("L'utilisateur " + name + " n'est pas trouvé", 404);
        }
        return entity;
    }

    @DELETE
    @Path("{name}")
    @Transactional
    public Response delete(String name) {
        UserEntity entity = UserEntity.findById(name);
        if (entity == null) {
            throw new WebApplicationException("L'utilisateur " + name + " n'est pas trouvé", 404);
        }
        entity.delete();
        return Response.status(204).build();
    }

    @PUT
    @Path("{name}")
    @Transactional
    public UserEntity update(String name, UserEntity user) {
        UserEntity entity = UserEntity.findById(name);
        if (entity == null) {
            throw new WebApplicationException("L'utilisateur " + name + " n'est pas trouvé", 404);
        }

        entity.name = user.name;
        entity.email = user.email;
        entity.roles = user.roles;
        entity.password = user.password;
        entity.theme = user.theme;

        return entity;
    }

}
