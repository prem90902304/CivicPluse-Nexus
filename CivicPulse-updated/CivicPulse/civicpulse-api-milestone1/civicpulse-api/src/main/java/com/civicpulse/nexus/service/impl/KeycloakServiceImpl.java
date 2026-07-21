package com.civicpulse.nexus.service.impl;

import com.civicpulse.nexus.entity.Role;
import com.civicpulse.nexus.entity.User;
import com.civicpulse.nexus.service.KeycloakService;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KeycloakServiceImpl implements KeycloakService {

    private final Keycloak keycloak;

    @Value("${keycloak.realm}")
    private String realm;

    @Override
    public void createUser(User user, String password) {

        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();

        UserRepresentation keycloakUser = new UserRepresentation();

        keycloakUser.setUsername(user.getEmail());
        keycloakUser.setEmail(user.getEmail());
        keycloakUser.setEnabled(true);
        keycloakUser.setEmailVerified(true);
        keycloakUser.setRequiredActions(List.of());

        // Split full name into first & last name
        String[] names = user.getFullName().trim().split("\\s+", 2);

        keycloakUser.setFirstName(names[0]);
        keycloakUser.setLastName(names.length > 1 ? names[1] : "User");

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(false);

        keycloakUser.setCredentials(List.of(credential));

        Response response = usersResource.create(keycloakUser);

        try {

            if (response.getStatus() != 201) {
                throw new RuntimeException(
                        "Failed to create Keycloak user. HTTP Status : "
                                + response.getStatus());
            }

        } finally {
            response.close();
        }
    }

    @Override
    public void assignRealmRole(String username, Role role) {

        RealmResource realmResource = keycloak.realm(realm);

        List<UserRepresentation> users =
                realmResource.users().search(username);

        if (users.isEmpty()) {
            throw new RuntimeException(
                    "User not found in Keycloak : " + username);
        }

        UserRepresentation keycloakUser = users.getFirst();

        RoleRepresentation roleRepresentation =
                realmResource.roles()
                        .get(role.name())
                        .toRepresentation();

        realmResource.users()
                .get(keycloakUser.getId())
                .roles()
                .realmLevel()
                .add(List.of(roleRepresentation));
    }

    @Override
    public void resetPassword(String username, String newPassword) {
        RealmResource realmResource = keycloak.realm(realm);
        List<UserRepresentation> users = realmResource.users().search(username);
        if (users.isEmpty()) {
            throw new RuntimeException("User not found in Keycloak: " + username);
        }

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(newPassword);
        credential.setTemporary(false);
        realmResource.users().get(users.getFirst().getId()).resetPassword(credential);
    }

    @Override
    public void deleteUser(String username) {
        RealmResource realmResource = keycloak.realm(realm);
        List<UserRepresentation> users = realmResource.users().search(username);
        if (users.isEmpty()) {
            throw new RuntimeException("User not found in Keycloak: " + username);
        }
        realmResource.users().get(users.getFirst().getId()).remove();
    }

    @Override
    public void setUserEnabled(String username, boolean enabled) {
        RealmResource realmResource = keycloak.realm(realm);
        List<UserRepresentation> users = realmResource.users().search(username);
        if (users.isEmpty()) {
            throw new RuntimeException("User not found in Keycloak: " + username);
        }
        UserRepresentation keycloakUser = users.getFirst();
        keycloakUser.setEnabled(enabled);
        realmResource.users().get(keycloakUser.getId()).update(keycloakUser);
    }
}
