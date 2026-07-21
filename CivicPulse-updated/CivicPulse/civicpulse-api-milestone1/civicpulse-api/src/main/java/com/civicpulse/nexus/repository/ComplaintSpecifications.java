package com.civicpulse.nexus.repository;

import com.civicpulse.nexus.entity.Complaint;
import com.civicpulse.nexus.entity.ComplaintPriority;
import com.civicpulse.nexus.entity.ComplaintStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class ComplaintSpecifications {

    private ComplaintSpecifications() {
    }

    public static Specification<Complaint> withFilters(
            String keyword,
            ComplaintStatus status,
            ComplaintPriority priority,
            Long categoryId,
            Long departmentId,
            Long citizenId,
            Long assignedOfficerId,
            LocalDateTime fromDate,
            LocalDateTime toDate) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";

                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }

            if (citizenId != null) {
                predicates.add(cb.equal(root.get("citizen").get("id"), citizenId));
            }

            if (assignedOfficerId != null) {
                predicates.add(cb.equal(
                        root.get("assignedOfficer").get("id"),
                        assignedOfficerId
                ));
            }

            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        fromDate
                ));
            }

            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("createdAt"),
                        toDate
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}