package com.codequiz.dto;

import lombok.*;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String avatar;
    private String status;
    private Set<String> roles;
    private String password;
}
