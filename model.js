// Plausible year-by-year retirement cash-flow model. Reactive, not advice-grade.

export const CONSTANTS = {
  currentAge: 62,           // "Today" on the score bar
  endAge: 95,
  baseYear: 2023,           // calendar year at currentAge (retire at 63 -> "in 2024")
  returnRate: 0.02,         // annual growth on savings
  inflation: 0.025,         // applied to spending, medicare, and non-guaranteed income
  userSalary: 72000,        // annual, while age < retirementAge (non-guaranteed)
  garySalary: 36000,        // spouse annual, while age < spouseRetiresAt (non-guaranteed)
  garySSAnnual: 7000,       // spouse guaranteed income from spouseRetiresAt
  ssBaseMonthlyAt62: 1000,  // user Social Security if elected at 62
  ssDelayBonusPerYear: 0.12, // benefit increase per year of delay past 62
  medicareStartAge: 65,
};

export const DEFAULT_INPUTS = {
  retirementAge: 66,
  spouseRetiresAt: 68,      // Gary, on the user's age axis
  monthlySpending: 6240,
  netWorth: 1093293,
  addedIncomeMonthly: 1000,
  addedIncomeYears: 5,
  ssElectionAge: 67,
  medicareMonthly: 1093,
};

// min/max are grid-aligned with each default so clamping never knocks a
// value off its step grid (e.g. spending can always step back to $6,240).
export const INPUT_LIMITS = {
  retirementAge:      { min: 62, max: 75, step: 1 },
  spouseRetiresAt:    { min: 62, max: 75, step: 1 },
  monthlySpending:    { min: 1240, max: 20240, step: 250 },
  netWorth:           { min: 93293, max: 4993293, step: 50000 },
  addedIncomeMonthly: { min: 0, max: 10000, step: 250 },
  addedIncomeYears:   { min: 0, max: 30, step: 1 },
  ssElectionAge:      { min: 62, max: 70, step: 1 },
  medicareMonthly:    { min: 93, max: 3093, step: 50 },
};

export function clampInput(key, value) {
  const { min, max } = INPUT_LIMITS[key];
  return Math.min(max, Math.max(min, value));
}

export function simulate(inputs, c = CONSTANTS) {
  const ssAnnual =
    12 * c.ssBaseMonthlyAt62 * (1 + c.ssDelayBonusPerYear * (inputs.ssElectionAge - 62));
  const years = [];
  let savings = inputs.netWorth;
  let moneyLastsAge = null; // null = money never runs out before endAge

  for (let age = c.currentAge; age <= c.endAge; age++) {
    const infl = Math.pow(1 + c.inflation, age - c.currentAge);
    // Non-guaranteed income (salaries, added income) rises with inflation;
    // guaranteed income (Social Security) stays flat.
    const salary = (age < inputs.retirementAge ? c.userSalary : 0) * infl;
    const gary = (age < inputs.spouseRetiresAt ? c.garySalary : 0) * infl;
    const added =
      (age >= inputs.retirementAge && age < inputs.retirementAge + inputs.addedIncomeYears
        ? inputs.addedIncomeMonthly * 12 : 0) * infl;
    const ss = age >= inputs.ssElectionAge ? ssAnnual : 0;
    const garySS = age >= inputs.spouseRetiresAt ? c.garySSAnnual : 0;

    const nonGuaranteed = salary + gary + added;
    const guaranteed = ss + garySS;
    const income = nonGuaranteed + guaranteed;
    const spending =
      (inputs.monthlySpending * 12 +
        (age >= c.medicareStartAge ? inputs.medicareMonthly * 12 : 0)) * infl;

    savings *= 1 + c.returnRate;
    let withdrawal = 0;
    if (moneyLastsAge === null) {
      const need = Math.max(0, spending - income);
      if (need <= savings) {
        withdrawal = need;                                  // fill the gap up to the spending line
        savings = savings - need + Math.max(0, income - spending); // surplus is saved
      } else {
        withdrawal = savings;                               // partial final year
        moneyLastsAge = age + (need > 0 ? savings / need : 0);
        savings = 0;
      }
    }
    years.push({ age, nonGuaranteed, guaranteed, withdrawal, spending, savings });
  }
  return { years, moneyLastsAge, ranOut: moneyLastsAge !== null };
}

export function formatAge(age) {
  if (age === null) return '95y+';
  let y = Math.floor(age);
  let m = Math.round((age - y) * 12);
  if (m === 12) { y += 1; m = 0; }
  return `${y}y ${m}m`;
}

export function formatMoney(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}
