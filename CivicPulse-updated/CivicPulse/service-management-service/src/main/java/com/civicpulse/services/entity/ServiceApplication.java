package com.civicpulse.services.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "service_applications")
public class ServiceApplication extends BaseEntity {
    @Column(nullable = false, unique = true, length = 40)
    private String applicationNumber;

    @Column(nullable = false)
    private Long citizenId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ServiceType serviceType;

    @Column(nullable = false, length = 120)
    private String applicantName;

    @Column(nullable = false, length = 12)
    private String aadhaarNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ApplicationStatus status;

    @Column(length = 500)
    private String rejectionReason;

    @Column(length = 500)
    private String officerMessage;

    private Long verifiedByOfficerId;
    private LocalDateTime verifiedAt;
    private Long approvedByOfficerId;
    private LocalDateTime approvedAt;

    @Column(unique = true, length = 40)
    private String certificateNumber;

    @Column(length = 120)
    private String digitalSignature;

    @Builder.Default
    @Column(nullable = false)
    private Integer downloadCount = 0;

    @Builder.Default
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationDocument> documents = new ArrayList<>();
}
