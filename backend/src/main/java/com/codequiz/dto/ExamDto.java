package com.codequiz.dto;

import lombok.*;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamDto {
    private Long id;
    private String title;
    private String description;
    private Integer duration;
    private Integer totalQuestions;
    private String status;
    private Set<Long> questionIds;
    private java.util.List<QuestionDto> questions;
}
