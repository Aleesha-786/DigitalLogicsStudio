/**
 * Splits a simplified SOP/POS expression into its individual product/sum
 * terms, for the "step-by-step" truth table view. Pure function — no
 * component state involved, so it's safe to memoize on its inputs wherever
 * it's called.
 */
export const getIntermediateTerms = (expression, optimizationType, variables) => {
    if (!expression || expression === '1' || expression === '0') return [];

    const cleanExpr = expression.includes('=')
        ? expression.split('=')[1].trim()
        : expression;

    let terms = [];
    if (optimizationType === 'SOP') {
        terms = cleanExpr.split('+').map((t) => t.trim()).filter(Boolean);
    } else {
        const matches = cleanExpr.match(/\([^)]+\)/g);
        if (matches) {
            terms = matches.map((m) => m.replace(/[()]/g, '').trim());
        }
    }

    return terms.filter((term) => !variables.includes(term));
};

export default getIntermediateTerms;
