package com.civicpulse.nexus.exception;

/** Thrown on unique-constraint style conflicts (e.g. email already registered). Maps to HTTP 409. */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
