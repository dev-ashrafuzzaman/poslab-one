// journals.rules.js
export const validateJournalBusinessRules = (entries) => {
  let totalDebit = 0;
  let totalCredit = 0;

  for (const [index, e] of entries.entries()) {
    const debit = Number(e.debit || 0);
    const credit = Number(e.credit || 0);

    // ❌ both zero
    if (debit === 0 && credit === 0) {
      throw new Error(
        `Row ${index + 1}: Debit and Credit both cannot be 0`,
      );
    }

    // ❌ both filled
    if (debit > 0 && credit > 0) {
      throw new Error(
        `Row ${index + 1}: Both Debit and Credit filled`,
      );
    }

    totalDebit += debit;
    totalCredit += credit;
  }

  if (totalDebit <= 0 || totalCredit <= 0) {
    throw new Error("Journal must contain at least one debit and one credit");
  }

  if (totalDebit !== totalCredit) {
    throw new Error("Total debit and credit mismatch");
  }

  return { totalDebit, totalCredit };
};
