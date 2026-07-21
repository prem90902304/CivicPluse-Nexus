package com.civicpulse.nexus.repository;

import com.civicpulse.nexus.entity.ComplaintComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ComplaintCommentRepository
        extends JpaRepository<ComplaintComment, Long> {

    List<ComplaintComment> findByComplaintIdOrderByCreatedAtAsc(Long complaintId);

    @Transactional
    void deleteByComplaintId(Long complaintId);
}
