package com.htt.management.identity;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Server-owned access state, reloaded for every authenticated request. */
public record AccessSnapshot(UUID actorId, String displayName, Instant tokensValidAfter,
        List<CompanyAccess> companies,Set<String> globalPermissions) {
    public AccessSnapshot {
        companies = List.copyOf(companies);
        globalPermissions = globalPermissions==null?Set.of():Set.copyOf(globalPermissions);
    }
    public AccessSnapshot(UUID actorId,String displayName,Instant tokensValidAfter,List<CompanyAccess> companies) {
        this(actorId,displayName,tokensValidAfter,companies,Set.of());
    }

    public enum Realm { STAFF, CUSTOMER }
    public enum MemberKind { UNCLASSIFIED, CUSTOMER, SALES, MANAGEMENT, OPERATIONS }
    public enum AccessProfile { STANDARD, GROUP_READER, COMPANY_OWNER, SALES }
    public enum Scope { COMPANY, CUSTOMER, BRANCH }
    public enum ResourceKind { CUSTOMER, BRANCH, ORDER }

    public record CompanyAccess(UUID companyId, String companyName, UUID membershipId,
            MemberKind memberKind, Set<String> roles, Set<String> permissions, List<Grant> grants,AccessProfile accessProfile,String city) {
        public CompanyAccess {
            roles = Set.copyOf(roles);
            permissions = Set.copyOf(permissions);
            grants = List.copyOf(grants);
            accessProfile = accessProfile==null?AccessProfile.STANDARD:accessProfile;
        }
        public CompanyAccess(UUID companyId,String companyName,UUID membershipId,MemberKind memberKind,
                Set<String> roles,Set<String> permissions,List<Grant> grants,AccessProfile accessProfile) {
            this(companyId,companyName,membershipId,memberKind,roles,permissions,grants,accessProfile,null);
        }
        public CompanyAccess(UUID companyId,String companyName,UUID membershipId,MemberKind memberKind,
                Set<String> roles,Set<String> permissions,List<Grant> grants) {
            this(companyId,companyName,membershipId,memberKind,roles,permissions,grants,AccessProfile.STANDARD);
        }
        public boolean readOnly() { return accessProfile==AccessProfile.GROUP_READER; }
        public boolean permits(String action,boolean write) { return permissions.contains(action)&&(!write||!readOnly()); }
        public List<Grant> usableGrants() {
            return memberKind==MemberKind.SALES?grants.stream().filter(g->g.scope()!=Scope.COMPANY).toList():grants;
        }
    }

    public record Grant(UUID id, long version, Scope scope, UUID customerId,
            String customerCode, String customerName, Set<UUID> branchIds) {
        public Grant { branchIds = Set.copyOf(branchIds); }
    }

    /** Ownership is loaded from storage, never inferred from a request body. */
    public record ResourceOwner(UUID companyId, UUID customerId, UUID branchId) {}
}
