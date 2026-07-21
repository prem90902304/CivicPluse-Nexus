-- Run this once against an existing civicpulse_nexus_db before testing SLA escalation.
-- The old PostgreSQL check constraint did not include the ESCALATED status.

ALTER TABLE complaint_timeline
    DROP CONSTRAINT IF EXISTS complaint_timeline_status_check;

ALTER TABLE complaint_timeline
    ADD CONSTRAINT complaint_timeline_status_check
    CHECK (status IN (
        'NEW',
        'ASSIGNED',
        'IN_PROGRESS',
        'PENDING',
        'RESOLVED',
        'REJECTED',
        'CLOSED',
        'ESCALATED'
    ));
