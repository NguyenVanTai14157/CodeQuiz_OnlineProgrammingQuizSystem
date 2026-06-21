package com.codequiz.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {
    private long totalUsers;
    private long totalSubjects;
    private long totalQuestions;
    private long totalExams;
    private long totalAttempts;
}
