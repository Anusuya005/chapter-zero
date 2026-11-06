package com.chapterzero.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;

    private final long expirationTime = 1000L * 60 * 60 * 24 * 7;

    public JwtService(
            @Value("${jwt.secret}") String secret
    ) {

        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException(
                    "JWT secret must contain at least 32 characters"
            );
        }

        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(
                        StandardCharsets.UTF_8
                )
        );
    }

    public String generateToken(
            Long userId,
            String email,
            String name
    ) {

        Date now = new Date();

        Date expiration =
                new Date(
                        now.getTime()
                                + expirationTime
                );

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("name", name)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    public String extractEmail(
            String token
    ) {

        return getClaims(token)
                .getSubject();
    }

    public Long extractUserId(
            String token
    ) {

        Object value =
                getClaims(token)
                        .get("userId");

        if (value instanceof Number number) {
            return number.longValue();
        }

        return Long.valueOf(
                value.toString()
        );
    }

    public boolean isTokenValid(
            String token
    ) {

        try {

            Claims claims =
                    getClaims(token);

            return claims.getExpiration()
                    .after(new Date());

        } catch (Exception exception) {

            return false;
        }
    }

    private Claims getClaims(
            String token
    ) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}