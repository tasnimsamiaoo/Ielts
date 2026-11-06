/**
 * Official IELTS Raw to Band Score Conversion Tables
 */

export const LISTENING_BAND_TABLE: { minRaw: number; maxRaw: number; band: number }[] = [
  { minRaw: 39, maxRaw: 40, band: 9.0 },
  { minRaw: 37, maxRaw: 38, band: 8.5 },
  { minRaw: 35, maxRaw: 36, band: 8.0 },
  { minRaw: 32, maxRaw: 34, band: 7.5 },
  { minRaw: 30, maxRaw: 31, band: 7.0 },
  { minRaw: 26, maxRaw: 29, band: 6.5 },
  { minRaw: 23, maxRaw: 25, band: 6.0 },
  { minRaw: 18, maxRaw: 22, band: 5.5 },
  { minRaw: 16, maxRaw: 17, band: 5.0 },
  { minRaw: 13, maxRaw: 15, band: 4.5 },
  { minRaw: 10, maxRaw: 12, band: 4.0 },
  { minRaw: 6, maxRaw: 9, band: 3.5 },
  { minRaw: 4, maxRaw: 5, band: 3.0 },
  { minRaw: 2, maxRaw: 3, band: 2.5 },
  { minRaw: 1, maxRaw: 1, band: 2.0 },
  { minRaw: 0, maxRaw: 0, band: 1.0 },
];

export const ACADEMIC_READING_BAND_TABLE: { minRaw: number; maxRaw: number; band: number }[] = [
  { minRaw: 39, maxRaw: 40, band: 9.0 },
  { minRaw: 37, maxRaw: 38, band: 8.5 },
  { minRaw: 35, maxRaw: 36, band: 8.0 },
  { minRaw: 33, maxRaw: 34, band: 7.5 },
  { minRaw: 30, maxRaw: 32, band: 7.0 },
  { minRaw: 27, maxRaw: 29, band: 6.5 },
  { minRaw: 23, maxRaw: 26, band: 6.0 },
  { minRaw: 19, maxRaw: 22, band: 5.5 },
  { minRaw: 15, maxRaw: 18, band: 5.0 },
  { minRaw: 13, maxRaw: 14, band: 4.5 },
  { minRaw: 10, maxRaw: 12, band: 4.0 },
  { minRaw: 6, maxRaw: 9, band: 3.5 },
  { minRaw: 4, maxRaw: 5, band: 3.0 },
  { minRaw: 0, maxRaw: 3, band: 2.0 },
];

export const GENERAL_READING_BAND_TABLE: { minRaw: number; maxRaw: number; band: number }[] = [
  { minRaw: 40, maxRaw: 40, band: 9.0 },
  { minRaw: 39, maxRaw: 39, band: 8.5 },
  { minRaw: 37, maxRaw: 38, band: 8.0 },
  { minRaw: 36, maxRaw: 36, band: 7.5 },
  { minRaw: 34, maxRaw: 35, band: 7.0 },
  { minRaw: 32, maxRaw: 33, band: 6.5 },
  { minRaw: 30, maxRaw: 31, band: 6.0 },
  { minRaw: 27, maxRaw: 29, band: 5.5 },
  { minRaw: 23, maxRaw: 26, band: 5.0 },
  { minRaw: 19, maxRaw: 22, band: 4.5 },
  { minRaw: 15, maxRaw: 18, band: 4.0 },
  { minRaw: 12, maxRaw: 14, band: 3.5 },
  { minRaw: 8, maxRaw: 11, band: 3.0 },
  { minRaw: 0, maxRaw: 7, band: 2.0 },
];

/**
 * Converts a raw score (0-40) to an IELTS Band score (1.0 - 9.0)
 */
export function rawToBand(rawScore: number, module: 'listening' | 'reading', isAcademic = true): number {
  const table =
    module === 'listening'
      ? LISTENING_BAND_TABLE
      : isAcademic
      ? ACADEMIC_READING_BAND_TABLE
      : GENERAL_READING_BAND_TABLE;

  const bounded = Math.max(0, Math.min(40, Math.round(rawScore)));
  const match = table.find((tier) => bounded >= tier.minRaw && bounded <= tier.maxRaw);
  return match ? match.band : 1.0;
}

/**
 * Computes the overall IELTS band score from the 4 skills according to official rules:
 * - Computes mean of the 4 modules.
 * - If average fractional part is >= 0.25 and < 0.75, round to 0.5.
 * - If average fractional part is >= 0.75, round up to next whole number.
 * - If average fractional part is < 0.25, round down to whole number.
 */
export function calculateOverallBand(
  listening: number,
  reading: number,
  writing: number,
  speaking: number
): number {
  const sum = listening + reading + writing + speaking;
  const mean = sum / 4;
  const whole = Math.floor(mean);
  const frac = mean - whole;

  if (frac < 0.25) {
    return whole;
  } else if (frac < 0.75) {
    return whole + 0.5;
  } else {
    return whole + 1.0;
  }
}

/**
 * Formats a band score to 1 decimal place (e.g. 7.0 or 7.5)
 */
export function formatBand(band: number): string {
  return band.toFixed(1);
}

/**
 * Official IELTS CEFR & Descriptor mapping
 */
export function getBandDescriptor(band: number): { title: string; cefr: string; summary: string } {
  if (band >= 8.5) {
    return {
      title: 'Expert / Very Good User',
      cefr: 'C2',
      summary: 'Has fully operational command of the language: fluent with complete understanding.',
    };
  } else if (band >= 7.5) {
    return {
      title: 'Very Good User',
      cefr: 'C1',
      summary: 'Operational command, though with occasional unsystematic inaccuracies and inappropriacies.',
    };
  } else if (band >= 6.5) {
    return {
      title: 'Good / Competent User',
      cefr: 'B2+',
      summary: 'Generally effective command of the language despite some inaccuracies and misunderstandings.',
    };
  } else if (band >= 5.5) {
    return {
      title: 'Competent User / Modest',
      cefr: 'B2 / B1',
      summary: 'Has partial command of the language, coping with overall meaning in most situations.',
    };
  } else {
    return {
      title: 'Developing User',
      cefr: 'B1 / A2',
      summary: 'Basic competence is limited to familiar situations; frequent breakdowns in communication occur.',
    };
  }
}
