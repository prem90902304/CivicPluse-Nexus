package com.civicpulse.nexus.service.impl;
import com.civicpulse.nexus.repository.*;
import org.springframework.transaction.annotation.Transactional;
import com.civicpulse.nexus.dto.request.ComplaintStatusUpdateRequest;
import com.civicpulse.nexus.dto.request.CreateComplaintRequest;
import com.civicpulse.nexus.dto.response.ComplaintResponse;
import com.civicpulse.nexus.entity.Category;
import com.civicpulse.nexus.entity.Complaint;
import com.civicpulse.nexus.entity.ComplaintStatus;
import com.civicpulse.nexus.entity.Department;
import com.civicpulse.nexus.entity.Role;
import com.civicpulse.nexus.entity.User;
import com.civicpulse.nexus.exception.ResourceNotFoundException;
import com.civicpulse.nexus.mapper.ComplaintMapper;
import com.civicpulse.nexus.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.civicpulse.nexus.service.ComplaintTimelineService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import com.civicpulse.nexus.service.SlaService;
import com.civicpulse.nexus.entity.SlaStatus;
import com.civicpulse.nexus.kafka.KafkaEventProducer;
import com.civicpulse.nexus.event.ComplaintCreatedEvent;
import com.civicpulse.nexus.event.ComplaintAssignedEvent;
import com.civicpulse.nexus.event.ComplaintStatusUpdatedEvent;
import java.util.ArrayList;
@Service
@RequiredArgsConstructor
@Transactional
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintMapper complaintMapper;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final ComplaintTimelineService complaintTimelineService;
    private final SlaService slaService;
    private final KafkaEventProducer kafkaEventProducer;
    private final ComplaintTimelineRepository complaintTimelineRepository;
    private final ComplaintCommentRepository complaintCommentRepository;
    private final EscalationLogRepository escalationLogRepository;

    @Override
    public ComplaintResponse create(CreateComplaintRequest request) {

        User citizen = getCurrentUser();

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        Complaint complaint = Complaint.builder()
                .complaintNumber(generateComplaintNumber())
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .priority(request.getPriority())
                .status(ComplaintStatus.NEW)
                .citizen(citizen)
                .department(department)
                .category(category)
                .imageUrls(
                        request.getImageUrls() == null
                                ? new ArrayList<>()
                                : new ArrayList<>(request.getImageUrls())
                )
                .deadline(slaService.calculateDeadline(category))
                .slaStatus(SlaStatus.ON_TIME)
                .build();

        complaint = complaintRepository.saveAndFlush(complaint);

        kafkaEventProducer.publish(
                "complaint-created",
                ComplaintCreatedEvent.builder()
                        .complaintId(complaint.getId())
                        .complaintNumber(complaint.getComplaintNumber())
                        .citizenId(citizen.getId())
                        .citizenName(citizen.getFullName())
                        .citizenEmail(citizen.getEmail())
                        .departmentName(department.getName())
                        .categoryName(category.getName())
                        .createdAt(complaint.getCreatedAt())
                        .build()
        );

        complaintTimelineService.record(
                complaint,
                citizen.getFullName(),
                "Complaint Submitted"
        );

        return complaintMapper.toResponse(complaint);
    }

    @Override
    public ComplaintResponse getById(Long id) {

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Complaint not found"));

        verifyComplaintAccess(complaint, getCurrentUser());

        return complaintMapper.toResponse(complaint);
    }

    @Override
    public List<ComplaintResponse> getMyComplaints() {

        User citizen = getCurrentUser();

        return complaintRepository.findByCitizen(citizen)
                .stream()
                .map(complaintMapper::toResponse)
                .toList();
    }

    @Override
    public ComplaintResponse updateStatus(
            Long id,
            ComplaintStatusUpdateRequest request) {

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Complaint not found"));

        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.OFFICER
                && !isMunicipalOfficer(currentUser)
                && (complaint.getAssignedOfficer() == null
                || !currentUser.getId().equals(complaint.getAssignedOfficer().getId()))) {
            throw new AccessDeniedException("You can update only complaints assigned to you");
        }

        complaint.setStatus(request.getStatus());
        complaint.setUpdatedAt(LocalDateTime.now());

        if (request.getStatus() == ComplaintStatus.RESOLVED
                || request.getStatus() == ComplaintStatus.CLOSED) {
            complaint.setClosedAt(LocalDateTime.now());
        }

        Complaint savedComplaint =
                complaintRepository.saveAndFlush(complaint);

        kafkaEventProducer.publish(
                "complaint-status-updated",
                ComplaintStatusUpdatedEvent.builder()
                        .complaintId(savedComplaint.getId())
                        .complaintNumber(savedComplaint.getComplaintNumber())
                        .status(savedComplaint.getStatus())
                        .updatedAt(savedComplaint.getUpdatedAt())
                        .citizenEmail(complaint.getCitizen().getEmail())
                        .build()
        );

        complaintTimelineService.record(
                savedComplaint,
                currentUser.getFullName(),
                "Status changed to " + request.getStatus()
        );
        return complaintMapper.toResponse(savedComplaint);
    }

    @Override
    public ComplaintResponse assignOfficer(
            Long complaintId,
            Long officerId) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Complaint not found"));

        User officer = userRepository.findById(officerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Officer not found"));

        if (!officer.isEnabled()) {
            throw new IllegalArgumentException(
                    "Officer account is disabled");
        }

        if (officer.getRole() != Role.OFFICER) {
            throw new IllegalArgumentException(
                    "Selected user is not an OFFICER");
        }

        complaint.setAssignedOfficer(officer);
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaint.setUpdatedAt(LocalDateTime.now());

        complaint.setAssignedAt(LocalDateTime.now());

        Complaint savedComplaint =
                complaintRepository.saveAndFlush(complaint);

        kafkaEventProducer.publish(
                "complaint-assigned",
                ComplaintAssignedEvent.builder()
                        .complaintId(savedComplaint.getId())
                        .complaintNumber(savedComplaint.getComplaintNumber())
                        .officerId(officer.getId())
                        .officerName(officer.getFullName())
                        .officerEmail(officer.getEmail())
                        .citizenEmail(savedComplaint.getCitizen().getEmail())
                        .assignedAt(savedComplaint.getAssignedAt())
                        .build()
        );

        User admin = getCurrentUser();

        complaintTimelineService.record(
                savedComplaint,
                admin.getFullName(),
                "Assigned to Officer " + officer.getFullName()
        );

        return complaintMapper.toResponse(savedComplaint);
    }

    @Override
    @Transactional
    public void deleteComplaint(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Complaint not found with id: " + id)
                );

        // Delete every child record that owns a foreign key to this complaint.
        // Without this order PostgreSQL rejects the parent delete.
        complaintCommentRepository.deleteByComplaintId(id);
        complaintTimelineRepository.deleteByComplaintId(id);
        escalationLogRepository.deleteByComplaintId(id);

        // ElementCollection image rows are deleted by JPA with the parent.
        complaintRepository.delete(complaint);
    }

    /**
     * Returns the currently authenticated Keycloak user.
     */
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

        Optional<User> user = userRepository.findByEmailIgnoreCase(email);

        if (user.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Citizen not found in database: " + email);
        }

        return user.get();
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

    /**
     * Generates complaint numbers like:
     * CP-20260708-000001
     */
    private String generateComplaintNumber() {

        long count = complaintRepository.count() + 1;

        return String.format(
                "CP-%s-%06d",
                LocalDate.now().toString().replace("-", ""),
                count
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints() {

        return complaintRepository.findAll()
                .stream()
                .map(complaintMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAssignedComplaints() {
        User currentUser = getCurrentUser();
        List<Complaint> complaints = isMunicipalOfficer(currentUser)
                ? complaintRepository.findAll()
                : complaintRepository.findByAssignedOfficerId(currentUser.getId());

        return complaints
                .stream()
                .map(complaintMapper::toResponse)
                .toList();
    }

    private boolean isMunicipalOfficer(User user) {
        return user.getRole() == Role.OFFICER
                && "officer@civicpulse.com".equalsIgnoreCase(user.getEmail());
    }
}
