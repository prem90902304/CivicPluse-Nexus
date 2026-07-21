package com.civicpulse.nexus.service;

import com.civicpulse.nexus.dto.request.ComplaintStatusUpdateRequest;
import com.civicpulse.nexus.dto.request.CreateComplaintRequest;
import com.civicpulse.nexus.dto.response.ComplaintResponse;

import java.util.List;

public interface ComplaintService {

    /**
     * Create a new complaint.
     */
    ComplaintResponse create(CreateComplaintRequest request);

    /**
     * Get complaint by ID.
     */
    ComplaintResponse getById(Long id);

    /**
     * Get complaints of the currently logged-in citizen.
     */
    List<ComplaintResponse> getMyComplaints();

    /**
     * Update complaint status.
     */
    ComplaintResponse updateStatus(
            Long id,
            ComplaintStatusUpdateRequest request);

    /**
     * Assign an officer to a complaint.
     */
    ComplaintResponse assignOfficer(
            Long complaintId,
            Long officerId);

    List<ComplaintResponse> getAllComplaints();
    List<ComplaintResponse> getAssignedComplaints();

    void deleteComplaint(Long id);
}
