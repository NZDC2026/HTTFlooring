package com.htt.management.identity;

import java.time.Instant;

/** Verified metadata for revalidating long-lived connections. Never contains the bearer token. */
public record VerifiedToken(String issuer, String subject, Instant issuedAt, Instant expiresAt) {}
