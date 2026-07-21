package com.civicpulse.nexus.repository;

import com.civicpulse.nexus.entity.Complaint;
import com.civicpulse.nexus.entity.ComplaintTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ComplaintTimelineRepository
        extends JpaRepository<ComplaintTimeline, Long> {

    List<ComplaintTimeline> findByComplaintOrderByCreatedAtAsc(Complaint complaint);

    @Modifying
    @Query("DELETE FROM ComplaintTimeline timeline WHERE timeline.complaint.id = :complaintId")
    void deleteByComplaintId(@Param("complaintId") Long complaintId);
}