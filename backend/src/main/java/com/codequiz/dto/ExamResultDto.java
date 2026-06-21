package com.codequiz.dto;

import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResultDto {
    private Long attemptId;
    private Long examId;
    private String examTitle;
    private Integer totalCorrect;
    private Integer totalWrong;
    private Integer totalQuestions;
    private Double score;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime submitTime;
}
