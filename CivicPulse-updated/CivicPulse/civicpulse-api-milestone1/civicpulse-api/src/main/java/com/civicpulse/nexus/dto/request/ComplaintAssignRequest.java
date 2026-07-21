package com.civicpulse.nexus.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintAssignRequest {

    @NotNull(message = "Officer Id is required")
    private Long officerId;
}