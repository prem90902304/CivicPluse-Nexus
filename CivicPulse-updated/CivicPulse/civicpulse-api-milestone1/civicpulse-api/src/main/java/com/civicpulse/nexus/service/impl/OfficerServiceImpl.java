package com.civicpulse.nexus.service.impl;

import com.civicpulse.nexus.dto.request.CreateOfficerRequest;
import com.civicpulse.nexus.dto.response.OfficerResponse;
import com.civicpulse.nexus.entity.ComplaintStatus;
import com.civicpulse.nexus.entity.Department;
import com.civicpulse.nexus.entity.Role;
import com.civicpulse.nexus.entity.User;
import com.civicpulse.nexus.exception.DuplicateResourceException;
import com.civicpulse.nexus.exception.ResourceNotFoundException;
import com.civicpulse.nexus.repository.ComplaintRepository;
import com.civicpulse.nexus.repository.DepartmentRepository;
import com.civicpulse.nexus.repository.UserRepository;
import com.civicpulse.nexus.service.KeycloakService;
import com.civicpulse.nexus.service.OfficerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import com.civicpulse.nexus.dto.request.UpdateOfficerRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@Service
@RequiredArgsConstructor
@Transactional
public class OfficerServiceImpl implements OfficerService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;
    private final KeycloakService keycloakService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<OfficerResponse> getAllOfficers(Long departmentId) {

        List<User> officers = departmentId == null
                ? userRepository.findByRole(Role.OFFICER)
                : userRepository.findByRoleAndDepartmentId(Role.OFFICER, departmentId);

        return officers.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public OfficerResponse updateOfficer(
            Long id,
            UpdateOfficerRequest request) {

        User officer = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Officer not found"));

        if (officer.getRole() != Role.OFFICER) {
            throw new ResourceNotFoundException("Officer not found");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found"));

        officer.setFullName(request.getFullName().trim());
        officer.setPhone(request.getPhone());
        officer.setDepartment(department);

        return toResponse(userRepository.save(officer));
    }

    @Override
    public void deleteOfficer(Long id) {

        User officer = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Officer not found"));

        if (officer.getRole() != Role.OFFICER) {
            throw new ResourceNotFoundException("Officer not found");
        }

        long assignedComplaintCount =
                complaintRepository.countByAssignedOfficerId(id);

        if (assignedComplaintCount > 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete this officer because "
                            + assignedComplaintCount
                            + " complaint(s) are assigned. Reassign them first."
            );
        }

        keycloakService.deleteUser(officer.getEmail());
        userRepository.delete(officer);
    }

    @Override
    public OfficerResponse createOfficer(CreateOfficerRequest request) {

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException(
                    "An account with this email already exists"
            );
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found"));

        User officer = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.OFFICER)
                .department(department)
                .enabled(true)
                .build();

        keycloakService.createUser(officer, request.getPassword());
        keycloakService.assignRealmRole(officer.getEmail(), Role.OFFICER);

        User savedOfficer = userRepository.save(officer);

        return toResponse(savedOfficer);
    }

    @Override
    public void changeOfficerPassword(Long id, String newPassword) {

        User officer = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Officer not found"));

        if (officer.getRole() != Role.OFFICER) {
            throw new ResourceNotFoundException("Officer not found");
        }

        keycloakService.resetPassword(officer.getEmail(), newPassword);

        officer.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(officer);
    }

    @Override
    public OfficerResponse setOfficerEnabled(Long id, boolean enabled) {
        User officer = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found"));

        if (officer.getRole() != Role.OFFICER) {
            throw new ResourceNotFoundException("Officer not found");
        }

        keycloakService.setUserEnabled(officer.getEmail(), enabled);
        officer.setEnabled(enabled);
        return toResponse(userRepository.save(officer));
    }

    private OfficerResponse toResponse(User officer) {

        long activeCases = complaintRepository.countByAssignedOfficerIdAndStatusNotIn(
                officer.getId(),
                List.of(ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED)
        );

        long resolvedCases = complaintRepository.countByAssignedOfficerIdAndStatus(
                officer.getId(),
                ComplaintStatus.RESOLVED
        );

        return OfficerResponse.builder()
                .id(officer.getId())
                .fullName(officer.getFullName())
                .email(officer.getEmail())
                .phone(officer.getPhone())
                .departmentId(
                        officer.getDepartment() != null
                                ? officer.getDepartment().getId()
                                : null
                )
                .departmentName(
                        officer.getDepartment() != null
                                ? officer.getDepartment().getName()
                                : null
                )
                .enabled(officer.isEnabled())
                .activeCases(activeCases)
                .resolvedCases(resolvedCases)
                .build();
    }
}
