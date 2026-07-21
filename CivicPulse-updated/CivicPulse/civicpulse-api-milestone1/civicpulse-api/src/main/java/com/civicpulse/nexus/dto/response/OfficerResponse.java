package com.civicpulse.nexus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficerResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;

    private Long departmentId;
    private String departmentName;

    private boolean enabled;

    private long activeCases;
    private long resolvedCases;
}
