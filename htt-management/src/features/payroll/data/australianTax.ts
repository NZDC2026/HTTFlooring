// Schedule 1, Taxation Administration (Withholding Schedules) Instrument 2026.
// https://www.legislation.gov.au/F2026L00716/asmade/2026-06-12/text/original/epub/OEBPS/document_1/document_1.html
// Standard periodic payments only: no offsets, levy variations, study loans,
// bonuses/back pay, working holiday makers, termination payments or SAPTO.
export const taxScales = ['Manual', '1', '2', '3', '4-resident', '4-foreign', '5', '6'] as const;
export type TaxScale = typeof taxScales[number];
export const frequencies = ['Weekly', 'Fortnightly', 'Monthly', 'Quarterly'] as const;
const scales: Record<string, [
    number,
    number,
    number
][]> = {
    '1': [[188, .15, .15], [371, .2084, 11.0185], [515, .179, .1066], [932, .3227, 74.1674], [2246, .32, 71.6508], [3303, .39, 228.8816], [Infinity, .47, 493.1893]],
    '2': [[362, 0, 0], [538, .15, 54.3462], [673, .25, 108.2135], [721, .17, 54.3473], [865, .179, 60.8377], [1282, .3227, 185.1935], [2596, .32, 181.7319], [3653, .39, 363.4627], [Infinity, .47, 655.7704]],
    '3': [[2596, .30, .30], [3653, .37, 181.7308], [Infinity, .45, 474.0385]],
    '5': [[362, 0, 0], [721, .15, 54.3462], [865, .159, 60.8365], [1282, .3027, 185.1923], [2596, .30, 181.7308], [3653, .37, 363.4615], [Infinity, .45, 655.7692]],
    '6': [[362, 0, 0], [721, .15, 54.3462], [865, .159, 60.8365], [908, .3027, 185.1923], [1135, .3527, 230.6135], [1282, .3127, 185.1923], [2596, .31, 181.7308], [3653, .38, 363.4615], [Infinity, .46, 655.7692]]
};
export function australianWithholding(taxable: number, scale: TaxScale, frequency: typeof frequencies[number], payDate: string) {
    if (!Number.isFinite(taxable) || taxable < 0 || taxable > 1e9)
        throw new Error('Invalid taxable earnings.');
    if (payDate < '2026-07-01' || payDate > '2027-06-30')
        throw new Error('Automatic PAYG is available only for pay dates in 2026–27. Use a reviewed manual amount for another year.');
    if (scale === 'Manual')
        throw new Error('Manual withholding must be entered explicitly.');
    if (scale.startsWith('4-'))
        return Math.floor(Math.floor(taxable) * (scale === '4-resident' ? .47 : .45) + 1e-9);
    let cents = Math.round(taxable * 100);
    if (frequency === 'Monthly' && cents % 100 === 33)
        cents++;
    const equivalent = frequency === 'Weekly' ? cents / 100 : frequency === 'Fortnightly' ? cents / 200 : frequency === 'Monthly' ? cents * 3 / 1300 : cents / 1300, x = Math.floor(equivalent + 1e-9) + .99;
    const coefficient = scales[scale]?.find(([limit]) => x < limit);
    if (!coefficient)
        throw new Error('Unsupported PAYG scale.');
    const weekly = Math.max(0, Math.round(coefficient[1] * x - coefficient[2]));
    return frequency === 'Weekly' ? weekly : frequency === 'Fortnightly' ? weekly * 2 : frequency === 'Monthly' ? Math.round(weekly * 13 / 3) : weekly * 13;
}
