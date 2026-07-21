package com.civicpulse.nexus.service;

import com.civicpulse.nexus.dto.response.ComplaintTimelineResponse;
import com.civicpulse.nexus.entity.Complaint;

import java.util.List;

public interface ComplaintTimelineService {

    void record(
            Complaint complaint,
            String updatedBy,
            String remarks
    );

    List<ComplaintTimelineResponse> getTimeline(Long complaintId);
}