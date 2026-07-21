package com.civicpulse.nexus.exception;

/** Thrown when a complaint status change violates the allowed state machine. Maps to HTTP 400. */
public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}
