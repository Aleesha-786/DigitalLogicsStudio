/**
 * Parses and evaluates boolean expressions.
 * Supports: 
 * - AND: &, ., *
 * - OR: |, +
 * - NOT: !, ~, ' (postfix)
 * - XOR: ^
 * - Parentheses: ( )
 */

export const parseSOP = (expression) => {
  if (!expression) return [];
  const expr = stripLabel(expression);
  return expr.split(/\+|\|/).map(t => {
    const trimmed = t.trim();
    const lits = [];
    let i = 0;
    while (i < trimmed.length) {
      const ch = trimmed[i];
      // Only letters are variables; skip spaces, AND symbols, constants, etc.
      if (!/[A-Za-z]/.test(ch)) { i++; continue; }
      const neg = (i + 1 < trimmed.length && trimmed[i + 1] === "'");
      lits.push({ v: ch.toUpperCase(), n: neg });
      i += neg ? 2 : 1;
    }
    return lits;
  }).filter(term => term.length > 0);
};

export const evaluateSOP = (terms, assign) => {
  // Bridge for old code: convert terms back to string and evaluate
  const expr = terms.map(t => t.map(l => l.v + (l.n ? "'" : "")).join('&')).join('|');
  return evaluateExpression(expr, assign);
};

/** Strips a leading "F =" style label (any single identifier before "="). */
export const stripLabel = (expression) =>
  String(expression || '').replace(/^\s*[A-Za-z]\w*\s*=(?!=)/, '').trim();

/** Sorted unique variable names (A-Z) used by an expression, ignoring the label. */
export const extractVariables = (expression) => {
  const body = stripLabel(expression).replace(/\bXN?OR\b/gi, ' ');
  return [...new Set(body.toUpperCase().match(/[A-Z]/g) || [])].sort();
};

// ── Tokenizer ───────────────────────────────────────────────────────────────
const tokenize = (str) => {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (/\s/.test(ch)) { i++; continue; }
    const word = str.slice(i).match(/^(XNOR|XOR)(?![A-Z])/);
    if (word) { tokens.push({ type: word[1] }); i += word[1].length; continue; }
    if (/[A-Z]/.test(ch)) { tokens.push({ type: 'VAR', val: ch }); i++; continue; }
    if (ch === '0' || ch === '1') { tokens.push({ type: 'CONST', val: ch === '1' }); i++; continue; }
    if (ch === '!' || ch === '~' || ch === '¬') { tokens.push({ type: 'NOT' }); i++; continue; }
    if ('&.*•·∧'.includes(ch)) { tokens.push({ type: 'AND' }); i++; continue; }
    if ('|+∨'.includes(ch)) { tokens.push({ type: 'OR' }); i++; continue; }
    if (ch === '^' || ch === '⊕') { tokens.push({ type: 'XOR' }); i++; continue; }
    if (ch === '⊙') { tokens.push({ type: 'XNOR' }); i++; continue; }
    if (ch === '(') { tokens.push({ type: 'LPAREN' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'RPAREN' }); i++; continue; }
    if (ch === "'" || ch === '’') { tokens.push({ type: 'POST_NOT' }); i++; continue; }
    throw new Error(`Unexpected character "${ch}"`);
  }
  return tokens;
};

// ── Recursive-descent parser → evaluator ────────────────────────────────────
// Precedence (low → high): OR, XOR/XNOR, AND (explicit or implicit), NOT.
const parseAndEvaluate = (tokens, assign) => {
  let pos = 0;
  const peek = () => tokens[pos];
  const take = () => tokens[pos++];

  const startsFactor = (t) =>
    t && (t.type === 'VAR' || t.type === 'CONST' || t.type === 'LPAREN' || t.type === 'NOT');

  const parseOr = () => {
    let v = parseXor();
    while (peek() && peek().type === 'OR') { take(); const r = parseXor(); v = v || r; }
    return v;
  };
  const parseXor = () => {
    let v = parseAnd();
    while (peek() && (peek().type === 'XOR' || peek().type === 'XNOR')) {
      const op = take().type;
      const r = parseAnd();
      v = op === 'XOR' ? v !== r : v === r;
    }
    return v;
  };
  const parseAnd = () => {
    let v = parseUnary();
    while (peek() && (peek().type === 'AND' || startsFactor(peek()))) {
      if (peek().type === 'AND') take();
      const r = parseUnary();
      v = v && r;
    }
    return v;
  };
  const parseUnary = () => {
    if (peek() && peek().type === 'NOT') { take(); return !parseUnary(); }
    let v = parseAtom();
    while (peek() && peek().type === 'POST_NOT') { take(); v = !v; }
    return v;
  };
  const parseAtom = () => {
    const t = take();
    if (!t) throw new Error('Unexpected end of expression');
    if (t.type === 'VAR') return !!assign[t.val];
    if (t.type === 'CONST') return t.val;
    if (t.type === 'LPAREN') {
      const v = parseOr();
      if (!peek() || take().type !== 'RPAREN') throw new Error('Missing )');
      return v;
    }
    throw new Error(`Unexpected token ${t.type}`);
  };

  const result = parseOr();
  if (pos < tokens.length) throw new Error('Unexpected trailing input');
  return result;
};

export const evaluateExpression = (expression, assign) => {
  if (!expression) return 0;
  try {
    const tokens = tokenize(stripLabel(expression).toUpperCase());
    if (tokens.length === 0) return 0;
    return parseAndEvaluate(tokens, assign) ? 1 : 0;
  } catch (e) {
    return 0;
  }
};

export const generateTruthTable = (variables, expression) => {
  const headers = [...variables, 'F'];
  const rows = [];
  const n = variables.length;
  const total = Math.pow(2, n);
  for (let i = 0; i < total; i++) {
    const assign = {};
    for (let b = 0; b < n; b++) {
      const bit = (i >> (n - 1 - b)) & 1;
      assign[variables[b]] = bit === 1;
    }
    const f = expression ? evaluateExpression(expression, assign) : 0;
    rows.push([...variables.map(v => (assign[v] ? 1 : 0)), f]);
  }
  return { headers, rows };
};

export const getCanonicalForms = (variables, rows) => {
  const minterms = [];
  const maxterms = [];
  rows.forEach((row, i) => {
    const f = row[row.length - 1];
    if (f === 1) minterms.push(i);
    else maxterms.push(i);
  });
  
  const sop = minterms.length === 0 ? "0" : minterms.map(m => {
    const bits = m.toString(2).padStart(variables.length, '0');
    return variables.map((v, idx) => bits[idx] === '1' ? v : v + "'").join('');
  }).join(' + ');

  const pos = maxterms.length === 0 ? "1" : maxterms.map(m => {
    const bits = m.toString(2).padStart(variables.length, '0');
    const term = variables.map((v, idx) => bits[idx] === '1' ? v + "'" : v).join(' + ');
    return `(${term})`;
  }).join('');

  return { 
    sop, 
    pos, 
    minterms: `Σm(${minterms.join(', ')})`, 
    maxterms: `ΠM(${maxterms.join(', ')})` 
  };
};
