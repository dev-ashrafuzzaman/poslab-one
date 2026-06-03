/**
 * Strict accounting integrity checker enforcing double-entry and mathematical boundaries.
 */
export const validateJournalBusinessRules = (entries) => {
  if (!Array.isArray(entries) || entries.length < 2) {
    throw new Error(
      "[Accounting Rule Violation] A valid journal requires at least two atomic entry lines.",
    );
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const [index, e] of entries.entries()) {
    // Force float conversion right at entry evaluation stage to completely bypass JavaScript floating bugs
    const debit = parseFloat((e.debit || 0).toFixed(2));
    const credit = parseFloat((e.credit || 0).toFixed(2));

    const rowNum = index + 1;

    // ❌ Error Rule 1: Zero value trap protection
    if (debit === 0 && credit === 0) {
      throw new Error(
        `Row ${rowNum}: Absolute vacuum error. Both debit and credit cannot be evaluated at 0.00.`,
      );
    }

    // ❌ Error Rule 2: Dual allocation conflict restriction
    if (debit > 0 && credit > 0) {
      throw new Error(
        `Row ${rowNum}: Overlapping mapping conflict. Debit and Credit values cannot be inputted on the same line row.`,
      );
    }

    // ❌ Error Rule 3: Defensive security guarding against malicious negative value injection requests
    if (debit < 0 || credit < 0) {
      throw new Error(
        `Row ${rowNum}: Negative value exception. Fraudulent negative financial inputs are strictly prohibited.`,
      );
    }

    totalDebit += debit;
    totalCredit += credit;
  }

  // ❌ Error Rule 4: Total Value Sanity check
  if (totalDebit <= 0 || totalCredit <= 0) {
    throw new Error(
      "[Accounting Rule Violation] Document distribution failed. Journal must contain at least one asset inflow and outflow line.",
    );
  }

  // ❌ Error Rule 5: Math precision double check using safe delta bounding range
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(
      `[Ledger Balancing Fault] Double-entry mismatch anomaly. Total Debits (${totalDebit}) must precisely balance Total Credits (${totalCredit}).`,
    );
  }

  return {
    totalDebit: parseFloat(totalDebit.toFixed(2)),
    totalCredit: parseFloat(totalCredit.toFixed(2)),
  };
};
