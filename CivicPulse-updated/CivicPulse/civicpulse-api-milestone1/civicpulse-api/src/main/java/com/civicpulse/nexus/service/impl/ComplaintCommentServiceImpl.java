package com.civicpulse.nexus.service.impl;

import com.civicpulse.nexus.dto.request.CreateComplaintCommentRequest;
import com.civicpulse.nexus.dto.response.ComplaintCommentResponse;
import com.civicpulse.nexus.entity.Complaint;
import com.civicpulse.nexus.entity.ComplaintComment;
import com.civicpulse.nexus.entity.User;
import com.civicpulse.nexus.entity.Role;
import com.civicpulse.nexus.exception.ResourceNotFoundException;
import com.civicpulse.nexus.repository.ComplaintCommentRepository;
import com.civicpulse.nexus.repository.ComplaintRepository;
import com.civicpulse.nexus.repository.UserRepository;
import com.civicpulse.nexus.service.ComplaintCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ComplaintCommentServiceImpl implements ComplaintCommentService {

    private final ComplaintCommentRepository commentRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintCommentResponse> getComments(Long complaintId) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        verifyComplaintAccess(complaint, getCurrentUser());

        return commentRepository.findByComplaintIdOrderByCreatedAtAsc(complaintId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ComplaintCommentResponse addComment(
            Long complaintId,
            CreateComplaintCommentRequest request) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Complaint not found"));

        User user = getCurrentUser();
        verifyComplaintAccess(complaint, user);

        ComplaintComment comment = ComplaintComment.builder()
                .complaint(complaint)
                .authorName(user.getFullName())
                .authorEmail(user.getEmail())
                .authorRole(user.getRole())
                .message(request.getMessage().trim())
                .build();

        return toResponse(commentRepository.save(comment));
    }

    private ComplaintCommentResponse toResponse(ComplaintComment comment) {
        return ComplaintCommentResponse.builder()
                .id(comment.getId())
                .authorName(comment.getAuthorName())
                .authorRole(comment.getAuthorRole())
                .message(comment.getMessage())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)) {
            throw new ResourceNotFoundException("Invalid authentication");
        }

        Jwt jwt = jwtAuthentication.getToken();

        String email = jwt.getClaimAsString("email");

        if (email == null || email.isBlank()) {
            email = jwt.getClaimAsString("preferred_username");
        }

        if (email == null || email.isBlank()) {
            throw new ResourceNotFoundException("Email not found in JWT");
        }

        final String userEmail = email;

        return userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found: " + userEmail));
    }

    private void verifyComplaintAccess(Complaint complaint, User user) {
        if (user.getRole() == Role.ADMIN || isMunicipalOfficer(user)) {
            return;
        }
        if (user.getRole() == Role.CITIZEN
                && complaint.getCitizen() != null
                && user.getId().equals(complaint.getCitizen().getId())) {
            return;
        }
        if (user.getRole() == Role.OFFICER
                && complaint.getAssignedOfficer() != null
                && user.getId().equals(complaint.getAssignedOfficer().getId())) {
            return;
        }
        throw new AccessDeniedException("You do not have access to this complaint");
    }

    private boolean isMunicipalOfficer(User user) {
        return user.getRole() == Role.OFFICER
                && "officer@civicpulse.com".equalsIgnoreCase(user.getEmail());
    }
}
