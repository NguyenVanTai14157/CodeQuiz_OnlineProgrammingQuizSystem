package com.codequiz.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamSubmissionDto {
    private Long examId;
    private List<QuestionAnswerDto> answers;
}
