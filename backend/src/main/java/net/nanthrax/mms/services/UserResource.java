package net.nanthrax.mms.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.nanthrax.mms.persistence.UserEntity;

import java.util.List;

@Path("/users")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

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

        return entity;
    }

}
