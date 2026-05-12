export const roundMoney = (amount, precision = 2) => {
  const value = Number(amount || 0);
  const factor = Math.pow(10, precision);
  return Math.round((value + Number.EPSILON) * factor) / factor;
};
