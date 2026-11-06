package com.chapterzero.backend.controller;

import com.chapterzero.backend.entity.User;
import com.chapterzero.backend.repository.UserRepository;
import com.chapterzero.backend.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(
            @RequestBody RegisterRequest request
    ) {

        if (
            request.name() == null ||
            request.name().trim().isEmpty()
        ) {
            throw new IllegalArgumentException(
                "Name is required"
            );
        }

        if (
            request.email() == null ||
            request.email().trim().isEmpty()
        ) {
            throw new IllegalArgumentException(
                "Email is required"
            );
        }

        if (
            request.password() == null ||
            request.password().length() < 6
        ) {
            throw new IllegalArgumentException(
                "Password must contain at least 6 characters"
            );
        }

        String email =
                request.email()
                        .trim()
                        .toLowerCase();

        if (
            userRepository.existsByEmailIgnoreCase(
                email
            )
        ) {
            throw new IllegalArgumentException(
                "An account with this email already exists"
            );
        }

        User user = new User();

        user.setName(
            request.name().trim()
        );

        user.setEmail(email);

        user.setPasswordHash(
            passwordEncoder.encode(
                request.password()
            )
        );

        User savedUser =
                userRepository.save(user);

        String token =
                jwtService.generateToken(
                    savedUser.getId(),
                    savedUser.getEmail(),
                    savedUser.getName()
                );

        return new AuthResponse(
            token,
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail()
        );
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody LoginRequest request
    ) {

        if (
            request.email() == null ||
            request.password() == null
        ) {
            throw new IllegalArgumentException(
                "Email and password are required"
            );
        }

        String email =
                request.email()
                        .trim()
                        .toLowerCase();

        User user =
                userRepository
                    .findByEmailIgnoreCase(email)
                    .orElseThrow(() ->
                        new IllegalArgumentException(
                            "Invalid email or password"
                        )
                    );

        if (
            !passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
            )
        ) {
            throw new IllegalArgumentException(
                "Invalid email or password"
            );
        }

        String token =
                jwtService.generateToken(
                    user.getId(),
                    user.getEmail(),
                    user.getName()
                );

        return new AuthResponse(
            token,
            user.getId(),
            user.getName(),
            user.getEmail()
        );
    }

    // =========================================================
    // REQUEST / RESPONSE RECORDS
    // =========================================================

    public record RegisterRequest(
            String name,
            String email,
            String password
    ) {}

    public record LoginRequest(
            String email,
            String password
    ) {}

    public record AuthResponse(
            String token,
            Long userId,
            String name,
            String email
    ) {}
}