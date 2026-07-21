package com.civicpulse.nexus.dto.request;

import com.civicpulse.nexus.entity.ComplaintPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateComplaintRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Department is required")
    private Long departmentId;

    @Builder.Default
    private ComplaintPriority priority = ComplaintPriority.MEDIUM;

    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();
}