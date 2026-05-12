export const buildAccountTransferNarration = ({
  fromBranch,
  fromAccount,
  toBranch,
  toAccount,
  amount,
  charge,
  userNarration,
}) => {

  const base = `${fromAccount} (${fromBranch}) → ${toAccount} (${toBranch}) Transfer ৳${amount}`;

  const chargePart = charge > 0 ? ` | Charge ৳${charge}` : "";

  const userPart = userNarration ? ` | ${userNarration}` : "";

  return `${base}${chargePart}${userPart}`;
};