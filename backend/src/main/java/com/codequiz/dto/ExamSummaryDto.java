package com.codequiz.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamSummaryDto {
    private Long id;
    private String title;
    private String description;
    private Integer duration;
    private Integer totalQuestions;
    private String status;
}
