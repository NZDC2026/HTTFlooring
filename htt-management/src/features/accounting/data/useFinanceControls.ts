import {useSupplierPrepayments} from '../../supplier-prepayments/supplierPrepaymentRepository';
import {calculatePrepaymentReconciliation,includePrepaymentControl} from '../../supplier-prepayments/prepaymentReconciliation';
import {useSuppliers} from '../../contacts/data/useSuppliers';
import { useCustomerDeposits } from '../../customer-deposits/customerDepositRepository';
import { calculateDepositReconciliation, includeDepositControl } from '../../customer-deposits/depositReconciliation';
import { useCustomers } from '../../contacts/data/useCustomers';
import {
    useMemo,
} from "react";

import {
    useAccounts,
    useJournalEntries,
} from "./useAccounting";

import {
    useBankAccounts,
} from "../../banking/data/useBanking";

import {
    useAccountsReceivableGlReconciliation,
} from "./useAccountsReceivableGlReconciliation";

import {
    useAccountsPayableGlReconciliation,
} from "./useAccountsPayableGlReconciliation";

import {
    calculateFinanceControls,
} from "./financeControlsService";

export function useFinanceControls(
    asOfDate:
        string,
) {
    const prepayments=useSupplierPrepayments(),suppliers=useSuppliers();
    const deposits=useCustomerDeposits(), customers=useCustomers();
    const accounts =
        useAccounts();

    const journalEntries =
        useJournalEntries();

    const bankAccounts =
        useBankAccounts();

    const arReconciliation =
        useAccountsReceivableGlReconciliation(
            asOfDate,
        );

    const apReconciliation =
        useAccountsPayableGlReconciliation(
            asOfDate,
        );

    return useMemo(
        () =>
            includePrepaymentControl(includeDepositControl(calculateFinanceControls({
                accounts,

                journalEntries,

                bankAccounts,

                arReconciliation,

                apReconciliation,

                asOfDate,
            }),calculateDepositReconciliation({deposits,accounts,journals:journalEntries,banks:bankAccounts,customers,asOfDate})),calculatePrepaymentReconciliation({prepayments,accounts,journals:journalEntries,banks:bankAccounts,suppliers,asOfDate})),
        [
            prepayments,suppliers,deposits,customers,
            accounts,
            journalEntries,
            bankAccounts,
            arReconciliation,
            apReconciliation,
            asOfDate,
        ],
    );
}