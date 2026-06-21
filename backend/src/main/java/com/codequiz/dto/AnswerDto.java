package com.codequiz.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerDto {
    private Long id;
    private String answerContent;
    private Boolean isCorrect;
}
