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
  const expr = expression.replace(/^F\s*=\s*/, '').trim();
  return expr.split('+').map(t => {
    const trimmed = t.trim();
    const lits = [];
    let i = 0;
    while (i < trimmed.length) {
      const ch = trimmed[i];
      if (ch === ' ') { i++; continue; }
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

const tokenize = (str) => {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[A-Z]/.test(ch)) { tokens.push({ type: 'VAR', val: ch }); i++; continue; }
    if (ch === '!') { tokens.push({ type: 'NOT' }); i++; continue; }
    if (ch === '~') { tokens.push({ type: 'NOT' }); i++; continue; }
    if (ch === '&' || ch === '.' || ch === '*') { tokens.push({ type: 'AND' }); i++; continue; }
    if (ch === '|') { tokens.push({ type: 'OR' }); i++; continue; }
    if (ch === '+') { tokens.push({ type: 'OR' }); i++; continue; }
    if (ch === '^') { tokens.push({ type: 'XOR' }); i++; continue; }
    if (ch === '(') { tokens.push({ type: 'LPAREN' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'RPAREN' }); i++; continue; }
    if (ch === "'") { tokens.push({ type: 'POST_NOT' }); i++; continue; }
    // Handle implicit AND (e.g., AB)
    if (tokens.length > 0) {
      const prev = tokens[tokens.length - 1];
      if ((prev.type === 'VAR' || prev.type === 'RPAREN' || prev.type === 'POST_NOT') && (ch === 'A' || ch === '(')) {
        // This is simplified, real implicit AND is harder but this covers AB, (A)B
      }
    }
    i++;
  }
  return tokens;
};

// Simplified parser for demonstration - converts to postfix for evaluation
const getPrecedence = (type) => {
  if (type === 'POST_NOT' || type === 'NOT') return 4;
  if (type === 'AND') return 3;
  if (type === 'XOR') return 2;
  if (type === 'OR') return 1;
  return 0;
};

const toPostfix = (tokens) => {
  const output = [];
  const stack = [];
  tokens.forEach((token, idx) => {
    if (token.type === 'VAR') {
      output.push(token);
      // Check for implicit AND: if next is VAR or LPAREN
      const next = tokens[idx + 1];
      if (next && (next.type === 'VAR' || next.type === 'LPAREN' || next.type === 'NOT')) {
        stack.push({ type: 'AND' });
      }
    } else if (token.type === 'LPAREN') {
      stack.push(token);
    } else if (token.type === 'RPAREN') {
      while (stack.length && stack[stack.length - 1].type !== 'LPAREN') {
        output.push(stack.pop());
      }
      stack.pop();
      // Check for implicit AND after RPAREN
      const next = tokens[idx + 1];
      if (next && (next.type === 'VAR' || next.type === 'LPAREN' || next.type === 'NOT')) {
        while (stack.length && getPrecedence(stack[stack.length - 1].type) >= getPrecedence('AND')) {
          output.push(stack.pop());
        }
        stack.push({ type: 'AND' });
      }
    } else if (token.type === 'POST_NOT') {
      output.push(token);
      // Check for implicit AND after POST_NOT
      const next = tokens[idx + 1];
      if (next && (next.type === 'VAR' || next.type === 'LPAREN' || next.type === 'NOT')) {
        stack.push({ type: 'AND' });
      }
    } else {
      while (stack.length && getPrecedence(stack[stack.length - 1].type) >= getPrecedence(token.type)) {
        output.push(stack.pop());
      }
      stack.push(token);
    }
  });
  while (stack.length) output.push(stack.pop());
  return output;
};

export const evaluateExpression = (expression, assign) => {
  if (!expression) return 0;
  try {
    const tokens = tokenize(expression.toUpperCase());
    const postfix = toPostfix(tokens);
    const stack = [];
    postfix.forEach(token => {
      if (token.type === 'VAR') {
        stack.push(!!assign[token.val]);
      } else if (token.type === 'NOT') {
        const a = stack.pop();
        stack.push(!a);
      } else if (token.type === 'POST_NOT') {
        const a = stack.pop();
        stack.push(!a);
      } else if (token.type === 'AND') {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a && b);
      } else if (token.type === 'OR') {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a || b);
      } else if (token.type === 'XOR') {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(a !== b);
      }
    });
    return stack[0] ? 1 : 0;
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
