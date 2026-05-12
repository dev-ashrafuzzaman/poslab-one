// loyaltyRules.js
export function canActivateMembership(amount, settings) {
  // Minimum first qualifying sale
  if (settings.minActivationAmount) {
    return amount >= settings.minActivationAmount;
  }

  // fallback
  return amount > 0;
}
