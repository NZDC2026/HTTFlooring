/** Diagnostic entry point; deliberately not run on every mutation. */
import { customerRepository } from "../../features/contacts/data/customerRepository";
import { supplierRepository } from "../../features/contacts/data/supplierRepository";
import { salesRepository } from "../../features/sales/data/salesRepository";
import { purchaseOrderRepository } from "../../features/purchases/data/purchaseOrderRepository";
import { auditMockReferences } from "./mockConsistencyAudit";

export function runMockConsistencyAudit() {
    return auditMockReferences({
        customers: customerRepository.getAll(),
        suppliers: supplierRepository.getAll(),
        sales: salesRepository.getAll(),
        purchaseOrders: purchaseOrderRepository.getAll(),
    });
}
