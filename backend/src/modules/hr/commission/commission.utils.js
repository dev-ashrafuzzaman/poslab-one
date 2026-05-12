export const calculateCommission = ({
  salesAmount,
  commissionType,
  commissionValue,
}) => {
  if (salesAmount <= 0) return 0;

  if (commissionType === "percentage") {
    return (salesAmount * commissionValue) / 100;
  }

  return commissionValue;
};
