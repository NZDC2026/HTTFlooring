import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable } from '@nestjs/common';

export interface RequestContext {
    requestId: string;
    userId?: string;
    tenantId?: string;
    organizationId?: string;
    membershipId?: string;
}

@Injectable()
export class RequestContextService {
    private readonly storage = new AsyncLocalStorage<RequestContext>();

    run<T>(context: RequestContext, callback: () => T,): T {
        return this.storage.run(context, callback);
    }

    get(): RequestContext | undefined {
        return this.storage.getStore();
    }

    getRequestId(): string | undefined {
        return this.get()?.requestId;
    }

    getUserId(): string | undefined {
        return this.get()?.userId;
    }

    getTenantId(): string | undefined {
        return this.get()?.tenantId;
    }

    getOrganizationId(): string | undefined {
        return this.get()?.organizationId;
    }

    getMembershipId(): string | undefined {
        return this.get()?.membershipId;
    }

    setIdentity(identity: { userId: string; tenantId: string; organizationId: string; membershipId: string; }): void {
        const context = this.storage.getStore();

        if (!context) {
            throw new Error('Request context is not initialized',);
        }

        context.userId = identity.userId;
        context.tenantId = identity.tenantId;
        context.organizationId = identity.organizationId;
        context.membershipId = identity.membershipId;
    }

    requireTenantId(): string {
        const tenantId = this.getTenantId();

        if (!tenantId) {
            throw new Error(
                'Tenant context is not available',
            );
        }

        return tenantId;
    }

    requireUserId(): string {
        const userId = this.getUserId();

        if (!userId) {
            throw new Error(
                'User context is not available',
            );
        }

        return userId;
    }

    requireOrganizationId(): string {
        const organizationId =
            this.getOrganizationId();

        if (!organizationId) {
            throw new Error(
                'Organization context is not available',
            );
        }

        return organizationId;
    }

    requireMembershipId(): string {
        const membershipId =
            this.getMembershipId();

        if (!membershipId) {
            throw new Error(
                'Membership context is not available',
            );
        }

        return membershipId;
    }
}