package com.civicpulse.nexus.exception;

public class AccountDeactivatedException extends RuntimeException {

    public AccountDeactivatedException() {
        super("Your account is deactivated. Please contact an administrator.");
    }
}