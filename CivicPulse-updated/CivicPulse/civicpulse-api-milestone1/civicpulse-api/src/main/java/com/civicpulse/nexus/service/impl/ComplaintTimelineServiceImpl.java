package com.civicpulse.nexus.service.impl;

import com.civicpulse.nexus.dto.response.ComplaintTimelineResponse;
import com.civicpulse.nexus.entity.Complaint;
import com.civicpulse.nexus.entity.ComplaintTimeline;
import com.civicpulse.nexus.exception.ResourceNotFoundException;
import com.civicpulse.nexus.repository.ComplaintRepository;
import com.civicpulse.nexus.repository.ComplaintTimelineRepository;
import com.civicpulse.nexus.service.ComplaintTimelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ComplaintTimelineServiceImpl implements ComplaintTimelineService {

    private final ComplaintTimelineRepository complaintTimelineRepository;
    private final ComplaintRepository complaintRepository;

    @Override
    public void record(
            Complaint complaint,
            String updatedBy,
            String remarks) {

        ComplaintTimeline timeline = ComplaintTimeline.builder()
                .complaint(complaint)
                .status(complaint.getStatus())
                .updatedBy(updatedBy)
                .remarks(remarks)
                .build();

        complaintTimelineRepository.save(timeline);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintTimelineResponse> getTimeline(Long complaintId) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Complaint not found"));

        return complaintTimelineRepository
                .findByComplaintOrderByCreatedAtAsc(complaint)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ComplaintTimelineResponse mapToResponse(
            ComplaintTimeline timeline) {

        return ComplaintTimelineResponse.builder()
                .status(timeline.getStatus())
                .remarks(timeline.getRemarks())
                .updatedBy(timeline.getUpdatedBy())
                .createdAt(timeline.getCreatedAt())
                .build();
    }
}