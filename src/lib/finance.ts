import type { LoanConfig } from "@/lib/schemas/site";

export interface LoanInput {
  price: number;
  downPayment: number;
  /** Meses. */
  term: number;
  /** APR anual en %. */
  apr: number;
}

export interface LoanResult {
  principal: number;
  monthly: number;
  totalInterest: number;
  totalPaid: number;
  /** Fracción (0-1) del total de pagos que corresponde a capital. */
  principalShare: number;
}

/** Cuota francesa (pagos fijos mensuales). */
export function calculateLoan({ price, downPayment, term, apr }: LoanInput): LoanResult {
  const principal = Math.max(price - downPayment, 0);
  const monthlyRate = apr / 100 / 12;

  let monthly = 0;
  if (principal > 0 && term > 0) {
    monthly =
      monthlyRate === 0
        ? principal / term
        : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
  }

  const totalPaid = monthly * term;
  const totalInterest = Math.max(totalPaid - principal, 0);

  return {
    principal,
    monthly,
    totalInterest,
    totalPaid,
    principalShare: totalPaid > 0 ? principal / totalPaid : 1,
  };
}

const roundUpTo = (value: number, step: number) => Math.ceil(value / step) * step;
const roundDownTo = (value: number, step: number) => Math.floor(value / step) * step;

/** Límites permitidos del pago inicial para un precio dado. */
export function downPaymentBounds(price: number, config: LoanConfig) {
  const { minPercent, maxPercent, step } = config.downPayment;
  return {
    min: roundUpTo((price * minPercent) / 100, step),
    max: roundDownTo((price * maxPercent) / 100, step),
  };
}

export function defaultDownPayment(price: number, config: LoanConfig) {
  const { step, defaultPercent } = config.downPayment;
  const { min, max } = downPaymentBounds(price, config);
  const target = roundUpTo((price * defaultPercent) / 100, step);
  return Math.min(Math.max(target, min), max);
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
