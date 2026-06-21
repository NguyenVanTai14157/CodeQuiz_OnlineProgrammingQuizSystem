package com.codequiz.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectDto {
    private Long id;
    private String subjectName;
    private String description;
}
