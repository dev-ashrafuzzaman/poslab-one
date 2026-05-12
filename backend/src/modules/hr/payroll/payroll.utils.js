export const calculateSalary = ({
  baseSalary,
  attendance,
  commission = 0,
  bonus = 0,
}) => {
  const perDaySalary = baseSalary / attendance.totalDays;

  const absentDeduction =
    attendance.absentDays * perDaySalary;

  const lateDeduction =
    attendance.lateDays * (perDaySalary * 0.1); // 10% per late

  const grossSalary =
    baseSalary + commission + bonus;

  const totalDeduction =
    absentDeduction + lateDeduction;

  const netSalary =
    Math.max(grossSalary - totalDeduction, 0);

  return {
    deductions: {
      absentDeduction,
      lateDeduction,
      advanceDeduction: 0,
    },
    grossSalary,
    netSalary,
  };
};
