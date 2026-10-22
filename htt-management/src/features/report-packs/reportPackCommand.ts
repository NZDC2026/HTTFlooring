import { reportSettings } from '../report-settings/reportPresentation';
import {currentLogo} from '../branding/brandingState';
import { z } from 'zod';
import { accountRepository } from '../accounting/data/accountRepository';
import { journalEntryRepository } from '../accounting/data/journalEntryRepository';
import { bankAccountRepository } from '../banking/data/bankAccountRepository';
import { salesRepository } from '../sales/data/salesRepository';
import { creditNoteRepository } from '../sales/data/creditNoteRepository';
import { supplierBillRepository } from '../purchases/data/supplierBillRepository';
import { supplierCreditRepository } from '../purchases/data/supplierCreditRepository';
import { customerRepository } from '../contacts/data/customerRepository';
import { businessSettings, configurationRows } from '../business-workspace/configurationState';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { buildReportPack, type ReportPackSources } from './reportPackService';
export function reportPackSources(): ReportPackSources {
    const company = businessSettings();
    return { accounts: accountRepository.getAll(), journals: journalEntryRepository.getAll(), banks: bankAccountRepository.getAll(), documents: salesRepository.getAll(), customerCredits: creditNoteRepository.getAll(), customers: customerRepository.getAll().map(c => ({ id: c.id, businessName: c.businessName })), bills: supplierBillRepository.getAll(), supplierCredits: supplierCreditRepository.getAll(), company: { presentation:reportSettings(), name: company.companyName, currency: company.currency, timezone: company.timezone, ...(currentLogo()?{logo:currentLogo()}:{}) } };
}
export function generateSavedReportPack(raw: unknown) {
    const actor = trustedAuthorization.require('accounting.read');
    const input = z.object({ id: z.string().trim().min(1).max(200), expectedRevision: z.string().regex(/^\d+$/) }).strict().parse(raw);
    const config = configurationRows['report-packs']?.find(r => r.id === input.id);
    if (!config)
        throw new Error('Report pack configuration was not found.');
    if (config.revision !== input.expectedRevision)
        throw new Error('Report pack changed. Reload before generating.');
    if (config.status !== 'Active')
        throw new Error('Activate this report pack before generating.');
    return buildReportPack({ id: config.id, revision: config.revision, name: config.name, cover: config.cover, introduction: config.introduction, periodStart: config.periodStart, periodEnd: config.periodEnd, reports: config.reports }, reportPackSources(), { id: crypto.randomUUID(), generatedAt: new Date().toISOString(), generatedBy: actor.userId });
}
