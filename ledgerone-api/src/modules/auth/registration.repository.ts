import { Injectable } from '@nestjs/common';
import type { DatabaseExecutor, } from '../../infrastructure/database/database.types.js';
import { membershipRoles, memberships, organizations, roles, tenants, } from '../../infrastructure/database/schema/index.js';

export interface RegistrationTenant {
    id: string;
    name: string;
}

export interface RegistrationOrganization {
    id: string;
    tenantId: string;
    name: string;
}

export interface RegistrationMembership {
    id: string;
    tenantId: string;
    organizationId: string;
    userId: string;
}

export interface RegistrationRole {
    id: string;
    tenantId: string;
    name: string;
}

@Injectable()
export class RegistrationRepository {
    async createTenant(executor: DatabaseExecutor, name: string,): Promise<RegistrationTenant> {
        const [tenant] = await executor.insert(tenants).values({ name, }).returning({ id: tenants.id, name: tenants.name, });

        if (!tenant) {
            throw new Error('Tenant insert did not return a record',);
        }

        return tenant;
    }

    async createOrganization(executor: DatabaseExecutor, input: { tenantId: string; name: string; },): Promise<RegistrationOrganization> {
        const [organization] = await executor.insert(organizations).values({ tenantId: input.tenantId, name: input.name, }).returning({
            id: organizations.id,
            tenantId: organizations.tenantId,
            name: organizations.name,
        });

        if (!organization) {
            throw new Error('Organization insert did not return a record',);
        }

        return organization;
    }

    async createMembership(
        executor: DatabaseExecutor,
        input: {
            tenantId: string;
            organizationId: string;
            userId: string;
        },
    ): Promise<RegistrationMembership> {
        const [membership] = await executor
            .insert(memberships)
            .values(input)
            .returning({
                id: memberships.id,
                tenantId: memberships.tenantId,
                organizationId: memberships.organizationId,
                userId: memberships.userId,
            });

        if (!membership) {
            throw new Error(
                'Membership insert did not return a record',
            );
        }

        return membership;
    }

    async createRole(
        executor: DatabaseExecutor,
        input: {
            tenantId: string;
            name: string;
        },
    ): Promise<RegistrationRole> {
        const [role] = await executor
            .insert(roles)
            .values(input)
            .returning({
                id: roles.id,
                tenantId: roles.tenantId,
                name: roles.name,
            });

        if (!role) {
            throw new Error(
                'Role insert did not return a record',
            );
        }

        return role;
    }

    async assignRole(
        executor: DatabaseExecutor,
        input: {
            membershipId: string;
            roleId: string;
        },
    ): Promise<void> {
        await executor
            .insert(membershipRoles)
            .values(input);
    }
}