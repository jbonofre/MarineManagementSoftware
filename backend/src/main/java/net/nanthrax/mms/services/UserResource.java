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
