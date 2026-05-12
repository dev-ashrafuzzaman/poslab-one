export function nextLoyaltyCount(current, required) {
  const next = current + 1;
  return {
    next,
    completed: next >= required,
  };
}
