import { describe, expect, it } from "vitest";
import { invoicePaymentTerms, paymentDueDate, paymentTermsLabel, validatePaymentTerms } from "./paymentTerms";

describe("payment terms", () => {
    it("keeps legacy day counts and COD compatible", () => {
        expect(paymentDueDate("2026-11-10", {paymentTermsDays: 30})).toBe("2026-12-10");
        expect(paymentDueDate("2026-11-10", {paymentTermsDays: 0})).toBe("2026-11-10");
        expect(paymentTermsLabel({paymentTermsDays: 0})).toBe("COD");
    });
    it.each([
        ["2026-11-10", 30, "2026-12-30"],
        ["2026-11-30", 10, "2026-12-10"],
        ["2026-12-15", 31, "2027-01-31"],
        ["2027-01-10", 30, "2027-02-28"],
        ["2028-01-31", 31, "2028-02-29"],
        ["2026-03-01", 31, "2026-04-30"],
    ])("calculates next-month terms for %s day %i", (date, day, expected) => {
        expect(paymentDueDate(date, {paymentTermsDays: day, paymentTermsType:"DAY_OF_MONTH"})).toBe(expected);
    });
    it.each([-1, 0, 32, 1.5, NaN])("rejects invalid month day %s", day => {
        expect(() => validatePaymentTerms({paymentTermsDays:day,paymentTermsType:"DAY_OF_MONTH"})).toThrow();
    });
    it("rejects invalid document dates and inconsistent COD", () => {
        expect(() => paymentDueDate("2026-02-30",{paymentTermsDays:30})).toThrow();
        expect(() => validatePaymentTerms({paymentTermsDays:30,paymentTermsType:"COD"})).toThrow();
    });
    it("uses explicit customer terms and preserves legacy company defaults", () => {
        expect(invoicePaymentTerms({paymentTermsDays:30},{terms:"14"})).toEqual({paymentTermsDays:14});
        expect(paymentDueDate("2026-11-10",invoicePaymentTerms({paymentTermsDays:30,paymentTermsType:"DAY_OF_MONTH"},{terms:"14"}))).toBe("2026-12-30");
    });
});
