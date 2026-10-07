export interface AccessTokenClaims {
    userId: string;
    tenantId: string;
    organizationId: string;
    membershipId: string;
}

export interface AccessTokenPayload {
    sub: string;
    tenantId: string;
    organizationId: string;
    membershipId: string;
}

export interface IssuedAccessToken {
    token: string;
    expiresIn: number;
}

export interface IssuedRefreshToken {
    token: string;
    tokenHash: string;
    expiresAt: Date;
}