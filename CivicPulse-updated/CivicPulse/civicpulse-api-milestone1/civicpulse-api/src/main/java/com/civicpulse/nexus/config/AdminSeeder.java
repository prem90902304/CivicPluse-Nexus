package com.civicpulse.nexus.config;

import com.civicpulse.nexus.entity.Role;
import com.civicpulse.nexus.entity.User;
import com.civicpulse.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        String email = "admin@civicpulse.com";

        if (userRepository.existsByEmail(email)) {
            return;
        }

        User admin = User.builder()
                .fullName("System Administrator")
                .email(email)
                .phone("9999999999")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .enabled(true)
                .build();

        userRepository.save(admin);

        System.out.println("=======================================");
        System.out.println("Default Admin Created");
        System.out.println("Email    : admin@civicpulse.com");
        System.out.println("Password : Admin@123");
        System.out.println("=======================================");
    }
}