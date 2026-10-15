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
import { registerRepository } from '../../src/features/security/repositoryHost';
registerRepository('salesRecovery', {
    repository: { recordSalesManualReview, closeVerifiedSalesReview }, read: 'audit.read',
    commands: { recordSalesManualReview: 'accounting.recover', closeVerifiedSalesReview: 'accounting.recover' },
    snapshot: () => [], restore: () => {}, publish: () => {},
});
export function initialize(principal: Parameters<typeof trustedAuthorization.connect>[0]) {
    trustedAuthorization.connect(principal);
    purchasePostingRecoveryAuthorization.configureTrustedSession(principal);
    initializeSalesAccounting();
    initializePurchasesAccounting();
}
