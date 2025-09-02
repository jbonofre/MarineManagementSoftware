package net.nanthrax.mms.services;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import net.nanthrax.mms.persistence.User;

import java.util.ArrayList;
import java.util.List;

@Path("/users")
public class UserResource {

    @GET
    public List<User> list() {
        List<User> users = new ArrayList<>();

        User user = new User();
        user.user = "admin";
        user.roles = "admin";
        user.password = "admin";
        user.email = "contact@msplaisance.com";
        users.add(user);

        return users;
    }

}
