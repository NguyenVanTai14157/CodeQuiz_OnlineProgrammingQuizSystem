package com.codequiz.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private Long id;
    private String content;
    private Long subjectId;
    private String difficultyLevel;
    private List<AnswerDto> answers;
}
