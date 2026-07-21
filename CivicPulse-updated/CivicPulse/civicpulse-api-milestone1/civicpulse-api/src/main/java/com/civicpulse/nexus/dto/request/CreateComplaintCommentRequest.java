package com.civicpulse.nexus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateComplaintCommentRequest {

    @NotBlank(message = "Comment message is required")
    @Size(max = 2000, message = "Comment must not exceed 2000 characters")
    private String message;
}