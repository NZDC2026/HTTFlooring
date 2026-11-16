package com.htt.management.crm.domain;

/** Company/contact identity. Typed profile fields remain in their existing detail extensions. */
public record CustomerSubject(String id,Type type,String parentCustomerId,String displayName,String email) {
    public enum Type { COMPANY, CONTACT }
}
