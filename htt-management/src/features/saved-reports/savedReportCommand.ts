import { z } from 'zod';
import { trustedAuthorization } from '../security/trustedAuthorization';
import { configurationRows } from '../business-workspace/configurationState';
import { reportPackSources } from '../report-packs/reportPackCommand';
import { buildSavedReport } from './savedReportService';
export function runSavedReport(raw: unknown) { const actor = trustedAuthorization.require('accounting.read'), input = z.object({ id: z.string().trim().min(1).max(200), expectedRevision: z.string().regex(/^\d+$/) }).strict().parse(raw), config = configurationRows['custom-reports']?.find(c => c.id === input.id); if (!config)
    throw new Error('Saved report was not found.'); if (config.revision !== input.expectedRevision)
    throw new Error('Saved report changed. Reload before running.'); if (config.status !== 'Active')
    throw new Error('Activate this saved report before running.'); return buildSavedReport({ id: config.id, revision: config.revision, name: config.name, dataset: config.dataset, columns: config.columns, basis: config.basis, filter: config.filter, favourite: config.favourite }, reportPackSources(), { id: crypto.randomUUID(), generatedAt: new Date().toISOString(), generatedBy: actor.userId }); }
