export function calculateTotalWithInterest(
  principal: number,
  interestRate: number,
  isFixed: boolean,
  fixedAmount: number
): number {
  if (isFixed) return principal + fixedAmount;
  return principal * (1 + interestRate / 100);
}

export function getInterestAmount(
  principal: number,
  interestRate: number,
  isFixed: boolean,
  fixedAmount: number
): number {
  if (isFixed) return fixedAmount;
  return principal * (interestRate / 100);
}
