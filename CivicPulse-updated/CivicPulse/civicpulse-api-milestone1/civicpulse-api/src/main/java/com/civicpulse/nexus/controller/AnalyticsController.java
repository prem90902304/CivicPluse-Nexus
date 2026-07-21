package com.civicpulse.nexus.controller;

import com.civicpulse.nexus.dto.response.ApiResponse;
import com.civicpulse.nexus.dto.response.ComplaintResponse;
import com.civicpulse.nexus.dto.response.DashboardStatsResponse;
import com.civicpulse.nexus.entity.ComplaintPriority;
import com.civicpulse.nexus.entity.ComplaintStatus;
import com.civicpulse.nexus.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.civicpulse.nexus.entity.Complaint;
import com.civicpulse.nexus.repository.ComplaintRepository;

import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final ComplaintService complaintService;
    private final ComplaintRepository complaintRepository;

    @GetMapping("/citizen")
    public ApiResponse<DashboardStatsResponse> getCitizenDashboard() {

        List<ComplaintResponse> complaints = complaintService.getMyComplaints();

        long total = complaints.size();

        long open = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.NEW)
                .count();

        long pending = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.ASSIGNED
                        || c.getStatus() == ComplaintStatus.IN_PROGRESS
                        || c.getStatus() == ComplaintStatus.ESCALATED)
                .count();

        long resolved = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED)
                .count();

        double averageResolutionHours = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED
                        && c.getCreatedAt() != null
                        && c.getUpdatedAt() != null)
                .mapToLong(c -> ChronoUnit.HOURS.between(
                        c.getCreatedAt(), c.getUpdatedAt()))
                .average()
                .orElse(0);

        List<DashboardStatsResponse.StatusCount> statusDistribution =
                java.util.Arrays.stream(ComplaintStatus.values())
                        .map(status -> new DashboardStatsResponse.StatusCount(
                                status.name(),
                                complaints.stream()
                                        .filter(c -> c.getStatus() == status)
                                        .count()
                        ))
                        .toList();

        List<DashboardStatsResponse.PriorityCount> priorityDistribution =
                java.util.Arrays.stream(ComplaintPriority.values())
                        .map(priority -> new DashboardStatsResponse.PriorityCount(
                                priority.name(),
                                complaints.stream()
                                        .filter(c -> c.getPriority() == priority)
                                        .count()
                        ))
                        .toList();

        List<DashboardStatsResponse.MonthlyTrend> monthlyTrends =
                java.util.stream.IntStream.rangeClosed(0, 5)
                        .mapToObj(index -> {
                            YearMonth month = YearMonth.now().minusMonths(5 - index);

                            long created = complaints.stream()
                                    .filter(c -> c.getCreatedAt() != null
                                            && YearMonth.from(c.getCreatedAt()).equals(month))
                                    .count();

                            long resolvedInMonth = complaints.stream()
                                    .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED
                                            && c.getUpdatedAt() != null
                                            && YearMonth.from(c.getUpdatedAt()).equals(month))
                                    .count();

                            return new DashboardStatsResponse.MonthlyTrend(
                                    month.getMonth().name().substring(0, 3),
                                    created,
                                    resolvedInMonth
                            );
                        })
                        .toList();

        DashboardStatsResponse response = DashboardStatsResponse.builder()
                .totalComplaints(total)
                .openComplaints(open)
                .pendingComplaints(pending)
                .resolvedComplaints(resolved)
                .avgResolutionHours(averageResolutionHours)
                .statusDistribution(statusDistribution)
                .priorityDistribution(priorityDistribution)
                .monthlyTrends(monthlyTrends)
                .build();

        return ApiResponse.success("Citizen dashboard statistics fetched", response);
    }

    @Transactional(readOnly = true)
    @GetMapping("/admin")
    public ApiResponse<DashboardStatsResponse> getAdminDashboard() {

        List<Complaint> complaints = complaintRepository.findAll();

        long total = complaints.size();

        long open = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.NEW)
                .count();

        long pending = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.ASSIGNED
                        || c.getStatus() == ComplaintStatus.IN_PROGRESS
                        || c.getStatus() == ComplaintStatus.ESCALATED)
                .count();

        long resolved = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED)
                .count();

        double averageResolutionHours = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED
                        && c.getCreatedAt() != null
                        && c.getUpdatedAt() != null)
                .mapToLong(c -> ChronoUnit.HOURS.between(
                        c.getCreatedAt(), c.getUpdatedAt()))
                .average()
                .orElse(0);

        List<DashboardStatsResponse.StatusCount> statusDistribution =
                java.util.Arrays.stream(ComplaintStatus.values())
                        .map(status -> new DashboardStatsResponse.StatusCount(
                                status.name(),
                                complaints.stream()
                                        .filter(c -> c.getStatus() == status)
                                        .count()
                        ))
                        .toList();

        List<DashboardStatsResponse.PriorityCount> priorityDistribution =
                java.util.Arrays.stream(ComplaintPriority.values())
                        .map(priority -> new DashboardStatsResponse.PriorityCount(
                                priority.name(),
                                complaints.stream()
                                        .filter(c -> c.getPriority() == priority)
                                        .count()
                        ))
                        .toList();

        List<DashboardStatsResponse.MonthlyTrend> monthlyTrends =
                java.util.stream.IntStream.rangeClosed(0, 5)
                        .mapToObj(index -> {
                            YearMonth month = YearMonth.now().minusMonths(5 - index);

                            long created = complaints.stream()
                                    .filter(c -> c.getCreatedAt() != null
                                            && YearMonth.from(c.getCreatedAt()).equals(month))
                                    .count();

                            long resolvedInMonth = complaints.stream()
                                    .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED
                                            && c.getUpdatedAt() != null
                                            && YearMonth.from(c.getUpdatedAt()).equals(month))
                                    .count();

                            return new DashboardStatsResponse.MonthlyTrend(
                                    month.getMonth().name().substring(0, 3),
                                    created,
                                    resolvedInMonth
                            );
                        })
                        .toList();

        Map<String, List<Complaint>> byDepartment = complaints.stream()
                .filter(c -> c.getDepartment() != null)
                .collect(Collectors.groupingBy(c -> c.getDepartment().getName()));

        List<DashboardStatsResponse.DepartmentPerformance> departmentPerformance =
                byDepartment.entrySet().stream()
                        .map(entry -> {
                            List<Complaint> departmentComplaints = entry.getValue();

                            long departmentResolved = departmentComplaints.stream()
                                    .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED)
                                    .count();

                            double departmentAvgHours = departmentComplaints.stream()
                                    .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED
                                            && c.getCreatedAt() != null
                                            && c.getUpdatedAt() != null)
                                    .mapToLong(c -> ChronoUnit.HOURS.between(
                                            c.getCreatedAt(), c.getUpdatedAt()))
                                    .average()
                                    .orElse(0);

                            return new DashboardStatsResponse.DepartmentPerformance(
                                    entry.getKey(),
                                    departmentComplaints.size(),
                                    departmentResolved,
                                    departmentAvgHours
                            );
                        })
                        .toList();

        DashboardStatsResponse response = DashboardStatsResponse.builder()
                .totalComplaints(total)
                .openComplaints(open)
                .pendingComplaints(pending)
                .resolvedComplaints(resolved)
                .avgResolutionHours(averageResolutionHours)
                .statusDistribution(statusDistribution)
                .priorityDistribution(priorityDistribution)
                .monthlyTrends(monthlyTrends)
                .departmentPerformance(departmentPerformance)
                .build();

        return ApiResponse.success("Admin dashboard statistics fetched", response);
    }

    @GetMapping("/officer")
    public ApiResponse<DashboardStatsResponse> getOfficerDashboard() {

        List<ComplaintResponse> complaints = complaintService.getAssignedComplaints();

        long total = complaints.size();

        long open = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.NEW)
                .count();

        long pending = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.ASSIGNED
                        || c.getStatus() == ComplaintStatus.IN_PROGRESS
                        || c.getStatus() == ComplaintStatus.ESCALATED)
                .count();

        long resolved = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED)
                .count();

        double averageResolutionHours = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED
                        && c.getCreatedAt() != null
                        && c.getUpdatedAt() != null)
                .mapToLong(c -> ChronoUnit.HOURS.between(
                        c.getCreatedAt(), c.getUpdatedAt()))
                .average()
                .orElse(0);

        List<DashboardStatsResponse.StatusCount> statusDistribution =
                java.util.Arrays.stream(ComplaintStatus.values())
                        .map(status -> new DashboardStatsResponse.StatusCount(
                                status.name(),
                                complaints.stream()
                                        .filter(c -> c.getStatus() == status)
                                        .count()
                        ))
                        .toList();

        List<DashboardStatsResponse.PriorityCount> priorityDistribution =
                java.util.Arrays.stream(ComplaintPriority.values())
                        .map(priority -> new DashboardStatsResponse.PriorityCount(
                                priority.name(),
                                complaints.stream()
                                        .filter(c -> c.getPriority() == priority)
                                        .count()
                        ))
                        .toList();

        List<DashboardStatsResponse.MonthlyTrend> monthlyTrends =
                java.util.stream.IntStream.rangeClosed(0, 5)
                        .mapToObj(index -> {
                            YearMonth month = YearMonth.now().minusMonths(5 - index);

                            long created = complaints.stream()
                                    .filter(c -> c.getCreatedAt() != null
                                            && YearMonth.from(c.getCreatedAt()).equals(month))
                                    .count();

                            long resolvedInMonth = complaints.stream()
                                    .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED
                                            && c.getUpdatedAt() != null
                                            && YearMonth.from(c.getUpdatedAt()).equals(month))
                                    .count();

                            return new DashboardStatsResponse.MonthlyTrend(
                                    month.getMonth().name().substring(0, 3),
                                    created,
                                    resolvedInMonth
                            );
                        })
                        .toList();

        DashboardStatsResponse response = DashboardStatsResponse.builder()
                .totalComplaints(total)
                .openComplaints(open)
                .pendingComplaints(pending)
                .resolvedComplaints(resolved)
                .avgResolutionHours(averageResolutionHours)
                .statusDistribution(statusDistribution)
                .priorityDistribution(priorityDistribution)
                .monthlyTrends(monthlyTrends)
                .build();

        return ApiResponse.success(
                "Officer dashboard statistics fetched",
                response
        );
    }
}