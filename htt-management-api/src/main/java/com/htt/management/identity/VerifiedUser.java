package com.htt.management.identity;

import java.security.Principal;

public record VerifiedUser(AccessSnapshot access, AccessSnapshot.Realm realm) implements Principal {
    @Override
    public String getName() { return access.actorId().toString(); }
}
