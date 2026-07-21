package com.civicpulse.nexus.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Unified identity table for Citizens, OFFICERs, and Admins.
 *
 * Why one table instead of three (Citizen/OFFICER/Admin)? Spring Security's
 * authentication model (UserDetailsService, JWT subject claim) is built around
 * a single "principal" concept. Splitting into three tables would mean three
 * parallel authentication paths — unnecessary complexity for what is
 * fundamentally the same login mechanism with a different `role` value and,
 * for OFFICER, an associated department. This is the standard enterprise
 * pattern for "single sign-on surface, multiple personas."
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "email"))
public class User extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 15)
    private String phone;

    /** BCrypt hash — never the raw password. Populated only via AuthServiceImpl. */
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    /** Only meaningful when role == OFFICER; null for CITIZEN/ADMIN. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = true;
}
