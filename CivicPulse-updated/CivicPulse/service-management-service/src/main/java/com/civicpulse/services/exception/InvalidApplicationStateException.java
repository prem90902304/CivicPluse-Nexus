package com.civicpulse.services.exception;

public class InvalidApplicationStateException extends RuntimeException {
    public InvalidApplicationStateException(String message) { super(message); }
}
