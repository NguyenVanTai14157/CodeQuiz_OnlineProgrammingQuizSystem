package com.codequiz.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionAnswerDto {
    private Long questionId;
    private Long selectedAnswerId;
}
