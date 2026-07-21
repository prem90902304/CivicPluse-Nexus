package com.civicpulse.nexus.exception;

/** Thrown when a lookup by ID/email/etc. finds nothing. Maps to HTTP 404. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
