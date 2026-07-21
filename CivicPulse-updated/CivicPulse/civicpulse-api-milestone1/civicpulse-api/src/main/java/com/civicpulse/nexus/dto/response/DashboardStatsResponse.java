package com.civicpulse.nexus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private long totalComplaints;
    private long openComplaints;
    private long pendingComplaints;
    private long resolvedComplaints;

    private double avgResolutionHours;

    @Builder.Default
    private List<StatusCount> statusDistribution = List.of();

    @Builder.Default
    private List<PriorityCount> priorityDistribution = List.of();

    @Builder.Default
    private List<MonthlyTrend> monthlyTrends = List.of();

    @Builder.Default
    private List<DepartmentPerformance> departmentPerformance = List.of();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusCount {
        private String status;
        private long count;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriorityCount {
        private String priority;
        private long count;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrend {
        private String month;
        private long created;
        private long resolved;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentPerformance {
        private String departmentName;
        private long total;
        private long resolved;
        private double avgHours;
    }
}