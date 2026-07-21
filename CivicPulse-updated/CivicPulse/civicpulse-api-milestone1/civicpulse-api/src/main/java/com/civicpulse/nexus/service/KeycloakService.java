package com.civicpulse.nexus.service;

import com.civicpulse.nexus.entity.Role;
import com.civicpulse.nexus.entity.User;

public interface KeycloakService {

    void createUser(User user, String password);

    void assignRealmRole(String username, Role role);

    void resetPassword(String username, String newPassword);

    void deleteUser(String username);

    void setUserEnabled(String username, boolean enabled);
}
