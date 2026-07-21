package com.civicpulse.nexus.util;

import java.util.List;

/**
 * Small, stateless constants used across layers. Centralizing these avoids
 * "magic strings/numbers" scattered through security and service code.
 */
public final class AppConstants {

    private AppConstants() {
    }

    public static final String AUTH_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";

    public static final String ROLE_CITIZEN = "CITIZEN";
    public static final String ROLE_OFFICIAL = "OFFICIAL";
    public static final String ROLE_ADMIN = "ADMIN";

    /** Statuses considered "closed" for SLA-breach scheduling purposes. */
    public static final List<String> TERMINAL_STATUSES = List.of("RESOLVED", "REJECTED", "CLOSED");
}
