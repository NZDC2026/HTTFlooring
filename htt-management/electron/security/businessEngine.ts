import {previewTargetedRepair,proposeTargetedRepair,executeTargetedRepair} from './targetedFinancialRepair';
import '../../src/features/document-output/purchaseOutputRepository';
import {inspectRecovery} from '../../src/features/sales/data/recoveryWorkbench';
import '../../src/features/supplier-prepayments/supplierPrepaymentRepository';
import '../../src/features/customer-deposits/customerDepositRepository';
import '../../src/features/customer-returns/customerReturnRepository';
import './payrollRepository';
import './documentRecycleRepository';
import './transferRepository';
import './attachmentRepository';
import '../../src/features/job-costing/jobCostingRepository';
import '../../src/features/contact-review/reviewRepository';
import '../../src/features/sales-visits/visitRepository';
import '../../src/features/recurring/recurringRepository';
import '../../src/features/supplier-returns/supplierReturnRepository';
import '../../src/features/document-output/outputRepository';
import '../../src/features/direct-documents/dispatchRepository';
import '../../src/features/direct-documents/managedDocumentRepository';
import '../../src/features/finance-foundation/openingBalanceRepository';
import '../../src/features/finance-closure/paymentBatchRepository';
import '../../src/features/finance-closure/settlementRepository';
import '../../src/features/finance-closure/bankStatementRepository';
import '../../src/features/business-workspace/productRepository';
import '../../src/features/business-workspace/workspaceRepository';
export { assertPostingPeriod } from '../../src/features/accounting/data/accountingPeriodRepository';
import { configurePeriodControls } from '../../src/features/accounting/data/accountingPeriodRepository';
import { periodCloseChecks } from './periodCloseChecks';
// Imported dynamically only after the main-owned storage adapter is installed.
import '../../src/features/sales/data/salesRepository';
import '../../src/features/sales/data/salesFulfilmentRepository';
import '../../src/features/purchases/data/supplierPaymentRepository';
import '../../src/features/purchases/data/supplierCreditRepository';
import '../../src/features/purchases/data/goodsReceiptRepository';
import '../../src/features/purchases/data/purchasePostingManualRecoveryService';
import '../../src/features/contacts/data/customerRepository';
import '../../src/features/contacts/data/customerPricingRepository';
import '../../src/features/banking/data/bankTransactionRepository';
import '../../src/features/banking/data/bankReconciliationRepository';
import { initializeSalesAccounting } from '../../src/features/accounting/data/salesAccountingBootstrap';
import { initializePurchasesAccounting } from '../../src/features/accounting/data/purchasesAccountingBootstrap';
import { trustedAuthorization } from '../../src/features/security/trustedAuthorization';
import { purchasePostingRecoveryAuthorization } from '../../src/features/purchases/data/purchasePostingRecoveryAuthorization';
import { recordSalesManualReview } from '../../src/features/sales/data/salesManualReviewService';
import { closeVerifiedSalesReview } from '../../src/features/sales/data/salesVerifiedRecoveryClosure';
import { snapshotRepositories } from '../../src/features/security/repositoryHost';
import { registerRepository } from '../../src/features/security/repositoryHost';
registerRepository('salesRecovery', {
    repository: { inspectRecovery, recordSalesManualReview, closeVerifiedSalesReview, previewTargetedRepair,proposeTargetedRepair,executeTargetedRepair }, read: 'audit.read',
    commands: { previewTargetedRepair:'audit.read',proposeTargetedRepair:'accounting.recover',executeTargetedRepair:'accounting.recover',inspectRecovery:'audit.read', recordSalesManualReview: 'accounting.recover', closeVerifiedSalesReview: 'accounting.recover' },
    snapshot: () => [], restore: () => {}, publish: () => {},
});
export const workspaceDefaults = snapshotRepositories();
export function initialize(principal: Parameters<typeof trustedAuthorization.connect>[0]) {
    configurePeriodControls(periodCloseChecks, () => principal()?.userId ?? '');
    trustedAuthorization.connect(principal);
    purchasePostingRecoveryAuthorization.configureTrustedSession(principal);
    initializeSalesAccounting();
    initializePurchasesAccounting();
}
