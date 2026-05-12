import { postJournalEntry } from "../journals/journals.service.js";


export const expenseAccounting = async ({
  db,
  session,
  expenseId,
  amount,
  expenseAccountId,
  paymentAccountId,
  branchId,
  narration,
}) => {
  const entries = [
    {
      accountId: expenseAccountId,
      debit: amount,
    },
    {
      accountId: paymentAccountId,
      credit: amount,
    },
  ];

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "EXPENSE",
    refId: expenseId,
    narration: narration || "Expense Entry",
    entries,
    branchId,
  });
};
