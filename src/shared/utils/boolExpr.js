/**
 * Strict Boolean-expression parsing and comparison, for places where a
 * learner's typed answer has to be judged (assessments).
 *
 * boolMath.js is deliberately lenient — it evaluates whatever it can and
 * returns 0 on anything it can't. That is fine for a calculator, but here a
 * typo must never be mistaken for a wrong answer, so malformed input is
 * rejected with a readable message instead.
 *
 * Grammar (NOT binds tightest, then AND, then OR):
 *   expr    := term ( ("+" | "|") term )*
 *   term    := factor ( ("." | "*" | "&")? factor )*   AND, written or implied
 *   factor  := ("!" | "~") factor | primary "'"*
 *   primary := A–Z | 0 | 1 | "(" expr ")"
 */

// Each parsed expression may use this many distinct variables; comparing two
// expressions walks every row of their combined truth table.
export const MAX_VARIABLES = 8;

const SYMBOLS = {
  "+": "OR",
  "|": "OR",
  ".": "AND",
  "*": "AND",
  "&": "AND",
  "·": "AND",
  "!": "NOT",
  "~": "NOT",
  "¬": "NOT",
  // Phone keyboards swap the straight apostrophe for a curly one.
  "'": "POST_NOT",
  "’": "POST_NOT",
  "‘": "POST_NOT",
  "′": "POST_NOT",
  "(": "LPAREN",
  ")": "RPAREN",
};

const fail = (message) => {
  const error = new Error(message);
  error.isExpressionError = true;
  throw error;
};

const tokenize = (input) => {
  const tokens = [];
  for (const ch of input) {
    if (/\s/.test(ch)) continue;
    if (/[A-Za-z]/.test(ch)) {
      tokens.push({ type: "VAR", text: ch.toUpperCase() });
    } else if (ch === "0" || ch === "1") {
      tokens.push({ type: "CONST", text: ch });
    } else if (SYMBOLS[ch]) {
      tokens.push({ type: SYMBOLS[ch], text: ch });
    } else {
      fail(
        `"${ch}" isn't supported. Use + for OR, ' for NOT, and write AND as AB or A·B.`,
      );
    }
  }
  return tokens;
};

const startsFactor = (token) =>
  Boolean(token) &&
  (token.type === "VAR" ||
    token.type === "CONST" ||
    token.type === "LPAREN" ||
    token.type === "NOT");

const parseTokens = (tokens) => {
  let pos = 0;
  const peek = () => tokens[pos];

  const parsePrimary = () => {
    const token = peek();
    const prev = tokens[pos - 1];
    if (!token) fail(`Something is missing after "${prev.text}".`);
    pos += 1;

    if (token.type === "VAR") return { type: "var", name: token.text };
    if (token.type === "CONST") {
      return { type: "const", value: Number(token.text) };
    }
    if (token.type === "LPAREN") {
      if (peek()?.type === "RPAREN") {
        fail("Empty parentheses — put an expression inside ( ).");
      }
      const inner = parseOr();
      if (peek()?.type !== "RPAREN") fail("A closing parenthesis is missing.");
      pos += 1;
      return inner;
    }
    if (token.type === "POST_NOT") {
      fail(`${token.text} needs something before it to complement.`);
    }
    if (!prev) fail(`An expression can't start with "${token.text}".`);
    return fail(
      `Something is missing between "${prev.text}" and "${token.text}".`,
    );
  };

  const parseFactor = () => {
    if (peek()?.type === "NOT") {
      pos += 1;
      return { type: "not", arg: parseFactor() };
    }
    let node = parsePrimary();
    while (peek()?.type === "POST_NOT") {
      pos += 1;
      node = { type: "not", arg: node };
    }
    return node;
  };

  const parseAnd = () => {
    const args = [parseFactor()];
    for (;;) {
      const next = peek();
      if (next?.type === "AND") {
        pos += 1;
        args.push(parseFactor());
      } else if (startsFactor(next)) {
        args.push(parseFactor());
      } else {
        break;
      }
    }
    return args.length === 1 ? args[0] : { type: "and", args };
  };

  const parseOr = () => {
    const args = [parseAnd()];
    while (peek()?.type === "OR") {
      pos += 1;
      args.push(parseAnd());
    }
    return args.length === 1 ? args[0] : { type: "or", args };
  };

  const ast = parseOr();
  // Everything else is consumed above, so a leftover can only be a stray ")".
  if (pos < tokens.length) {
    fail("There is a closing parenthesis with no opening one.");
  }
  return ast;
};

const collectVariables = (node, found = new Set()) => {
  if (node.type === "var") found.add(node.name);
  else if (node.type === "not") collectVariables(node.arg, found);
  else if (node.args) node.args.forEach((arg) => collectVariables(arg, found));
  return found;
};

/**
 * Parse a typed expression. A leading "F = " is allowed and ignored.
 * Returns { ok: true, ast, variables } or { ok: false, error }.
 */
export const parseExpression = (input) => {
  const text = String(input ?? "").replace(/^\s*[A-Za-z]\s*=/, "");
  try {
    const tokens = tokenize(text);
    if (!tokens.length) fail("Type an expression first.");
    const ast = parseTokens(tokens);
    const variables = Array.from(collectVariables(ast)).sort();
    if (variables.length > MAX_VARIABLES) {
      fail(`Use at most ${MAX_VARIABLES} different variables.`);
    }
    return { ok: true, ast, variables };
  } catch (error) {
    if (!error.isExpressionError) throw error;
    return { ok: false, error: error.message };
  }
};

export const evaluate = (node, assignment) => {
  switch (node.type) {
    case "var":
      return assignment[node.name] ? 1 : 0;
    case "const":
      return node.value;
    case "not":
      return evaluate(node.arg, assignment) ? 0 : 1;
    case "and":
      return node.args.every((arg) => evaluate(arg, assignment)) ? 1 : 0;
    default:
      return node.args.some((arg) => evaluate(arg, assignment)) ? 1 : 0;
  }
};

/**
 * Compare two parsed expressions row by row over every variable either one
 * uses. On a mismatch, `counterexample` is the first row where they differ.
 */
export const compareExpressions = (expected, actual) => {
  const variables = Array.from(
    new Set([...collectVariables(expected), ...collectVariables(actual)]),
  ).sort();
  const total = 2 ** variables.length;

  for (let row = 0; row < total; row += 1) {
    const assignment = {};
    variables.forEach((name, i) => {
      assignment[name] = (row >> (variables.length - 1 - i)) & 1;
    });
    const expectedValue = evaluate(expected, assignment);
    const actualValue = evaluate(actual, assignment);
    if (expectedValue !== actualValue) {
      return {
        equivalent: false,
        counterexample: {
          assignment,
          expected: expectedValue,
          actual: actualValue,
        },
      };
    }
  }
  return { equivalent: true, counterexample: null };
};

const flatten = (node) =>
  node.args.flatMap((arg) => (arg.type === node.type ? flatten(arg) : [arg]));

/**
 * A string that is identical for two expressions written the same way up to
 * the order and grouping of AND / OR operands — so "B + AC" matches "CA + B"
 * but not the merely equivalent "B + AC + AB".
 */
export const canonicalForm = (node) => {
  switch (node.type) {
    case "var":
      return node.name;
    case "const":
      return String(node.value);
    case "not":
      return `!${canonicalForm(node.arg)}`;
    default: {
      const parts = flatten(node).map(canonicalForm).sort();
      return `${node.type === "and" ? "&" : "|"}(${parts.join(",")})`;
    }
  }
};

/** TeX for a parsed expression, keeping the grouping the author wrote. */
export const toTex = (node) => {
  switch (node.type) {
    case "var":
      return node.name;
    case "const":
      return String(node.value);
    case "not": {
      const inner = toTex(node.arg);
      return node.arg.args ? `(${inner})'` : `${inner}'`;
    }
    case "and": {
      const parts = node.args.map((arg) =>
        arg.args ? `(${toTex(arg)})` : toTex(arg),
      );
      // "A1" reads as a name, so spell the operator out next to a constant.
      const hasConstant = node.args.some((arg) => arg.type === "const");
      return parts.join(hasConstant ? " \\cdot " : "");
    }
    default:
      return node.args
        .map((arg) => (arg.type === "or" ? `(${toTex(arg)})` : toTex(arg)))
        .join(" + ");
  }
};
