export type RollEvaluation =
  | {
      ok: true;
      kind: "number";
      value: number;
      message: string;
    }
  | {
      ok: true;
      kind: "text";
      value: string;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

type DiceMode = "sum" | "best" | "worst";

type Expression =
  | { kind: "number"; value: number }
  | { kind: "dice"; count: number; sides: number; mode: DiceMode }
  | { kind: "choice"; values: Array<number | string> }
  | { kind: "unary"; operator: "+" | "-"; operand: Expression }
  | {
      kind: "binary";
      operator: "+" | "-" | "*" | "/";
      left: Expression;
      right: Expression;
    };

interface ParsedRollExpression {
  expression: Expression;
  hasRoll: boolean;
}

interface EvaluatedValue {
  value: number | string;
  rolls: string[];
}

class Parser {
  private index = 0;
  private hasRoll = false;

  constructor(private readonly source: string) {}

  parse(): ParsedRollExpression | null {
    const expression = this.parseAdditive();
    this.skipWhitespace();
    return expression && this.index === this.source.length
      ? { expression, hasRoll: this.hasRoll }
      : null;
  }

  private parseAdditive(): Expression | null {
    let left = this.parseMultiplicative();
    if (!left) return null;
    while (true) {
      this.skipWhitespace();
      const operator = this.source[this.index];
      if (operator !== "+" && operator !== "-") return left;
      this.index += 1;
      const right = this.parseMultiplicative();
      if (!right) return null;
      left = { kind: "binary", operator, left, right };
    }
  }

  private parseMultiplicative(): Expression | null {
    let left = this.parseUnary();
    if (!left) return null;
    while (true) {
      this.skipWhitespace();
      const operator = this.source[this.index];
      if (operator !== "*" && operator !== "/") return left;
      this.index += 1;
      const right = this.parseUnary();
      if (!right) return null;
      left = { kind: "binary", operator, left, right };
    }
  }

  private parseUnary(): Expression | null {
    this.skipWhitespace();
    const operator = this.source[this.index];
    if (operator === "+" || operator === "-") {
      this.index += 1;
      const operand = this.parseUnary();
      return operand ? { kind: "unary", operator, operand } : null;
    }
    return this.parsePrimary();
  }

  private parsePrimary(): Expression | null {
    this.skipWhitespace();
    if (this.source[this.index] === "(") {
      this.index += 1;
      const expression = this.parseAdditive();
      this.skipWhitespace();
      if (!expression || this.source[this.index] !== ")") return null;
      this.index += 1;
      return expression;
    }

    return (
      this.parseBestWorstDice() ??
      this.parseChoice() ??
      this.parseStandardDice() ??
      this.parseNumber()
    );
  }

  private parseBestWorstDice(): Expression | null {
    const start = this.index;
    const modeCharacter = this.source[this.index]?.toLowerCase();
    if (
      (modeCharacter !== "b" && modeCharacter !== "w") ||
      this.source[this.index + 1] !== "["
    )
      return null;
    this.index += 2;
    const count = this.readInteger();
    if (count === null || this.source[this.index]?.toLowerCase() !== "d") {
      this.index = start;
      return null;
    }
    this.index += 1;
    const sides = this.readInteger();
    if (
      sides === null ||
      this.source[this.index] !== "]" ||
      !validDice(count, sides)
    ) {
      this.index = start;
      return null;
    }
    this.index += 1;
    this.hasRoll = true;
    return {
      kind: "dice",
      count,
      sides,
      mode: modeCharacter === "b" ? "best" : "worst",
    };
  }

  private parseStandardDice(): Expression | null {
    const start = this.index;
    const possibleCount = this.readInteger();
    if (this.source[this.index]?.toLowerCase() !== "d") {
      this.index = start;
      return null;
    }
    this.index += 1;
    const sides = this.readInteger();
    const count = possibleCount ?? 1;
    if (sides === null || !validDice(count, sides)) {
      this.index = start;
      return null;
    }
    this.hasRoll = true;
    return { kind: "dice", count, sides, mode: "sum" };
  }

  private parseChoice(): Expression | null {
    if (
      this.source[this.index]?.toLowerCase() !== "d" ||
      this.source[this.index + 1] !== "{"
    )
      return null;
    const close = this.source.indexOf("}", this.index + 2);
    if (close === -1) return null;
    const parts = this.source
      .slice(this.index + 2, close)
      .split(",")
      .map((part) => part.trim());
    if (!parts.length || parts.some((part) => part === "")) return null;
    const values = parts.map((part) => {
      const numeric = Number(part);
      return isFiniteDecimal(part) && Number.isFinite(numeric) ? numeric : part;
    });
    this.index = close + 1;
    this.hasRoll = true;
    return { kind: "choice", values };
  }

  private parseNumber(): Expression | null {
    this.skipWhitespace();
    const match = this.source
      .slice(this.index)
      .match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if (!match) return null;
    const value = Number(match[0]);
    if (!Number.isFinite(value)) return null;
    this.index += match[0].length;
    return { kind: "number", value };
  }

  private readInteger(): number | null {
    const match = this.source.slice(this.index).match(/^\d+/);
    if (!match) return null;
    this.index += match[0].length;
    return Number(match[0]);
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.source[this.index] ?? "")) this.index += 1;
  }
}

function validDice(count: number, sides: number): boolean {
  return (
    Number.isInteger(count) &&
    count >= 1 &&
    count <= 100 &&
    Number.isInteger(sides) &&
    sides >= 2 &&
    sides <= 1000
  );
}

function isFiniteDecimal(value: string): boolean {
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value);
}

export function parseRollExpression(
  source: string,
): ParsedRollExpression | null {
  return new Parser(source).parse();
}

export function isRollExpression(source: string): boolean {
  return parseRollExpression(source)?.hasRoll === true;
}

function evaluateNode(
  expression: Expression,
  random: () => number,
): EvaluatedValue | RollEvaluation {
  if (expression.kind === "number")
    return { value: expression.value, rolls: [] };
  if (expression.kind === "dice") {
    const results = Array.from(
      { length: expression.count },
      () => Math.floor(random() * expression.sides) + 1,
    );
    const value =
      expression.mode === "best"
        ? Math.max(...results)
        : expression.mode === "worst"
          ? Math.min(...results)
          : results.reduce((sum, result) => sum + result, 0);
    const mode = expression.mode === "sum" ? "" : ` ${expression.mode}`;
    return {
      value,
      rolls: [
        `${expression.count}d${expression.sides}${mode} [${results.join(", ")}]`,
      ],
    };
  }
  if (expression.kind === "choice") {
    const index = Math.floor(random() * expression.values.length);
    const value =
      expression.values[Math.min(index, expression.values.length - 1)]!;
    return { value, rolls: [`d{…} → ${String(value)}`] };
  }
  if (expression.kind === "unary") {
    const operand = evaluateNode(expression.operand, random);
    if ("ok" in operand) return operand;
    if (typeof operand.value !== "number")
      return {
        ok: false,
        message: "Cannot apply arithmetic to a non-numerical roll result.",
      };
    const value = expression.operator === "-" ? -operand.value : operand.value;
    return Number.isFinite(value)
      ? { value, rolls: operand.rolls }
      : { ok: false, message: "The roll produced a non-finite result." };
  }

  const left = evaluateNode(expression.left, random);
  if ("ok" in left) return left;
  const right = evaluateNode(expression.right, random);
  if ("ok" in right) return right;
  if (typeof left.value !== "number" || typeof right.value !== "number")
    return {
      ok: false,
      message: "Cannot apply arithmetic to a non-numerical roll result.",
    };
  if (expression.operator === "/" && right.value === 0)
    return { ok: false, message: "Cannot divide a roll result by zero." };
  const value =
    expression.operator === "+"
      ? left.value + right.value
      : expression.operator === "-"
        ? left.value - right.value
        : expression.operator === "*"
          ? left.value * right.value
          : left.value / right.value;
  return Number.isFinite(value)
    ? { value, rolls: [...left.rolls, ...right.rolls] }
    : { ok: false, message: "The roll produced a non-finite result." };
}

export function evaluateRollExpression(
  source: string,
  random: () => number = Math.random,
): RollEvaluation {
  const parsed = parseRollExpression(source);
  if (!parsed?.hasRoll)
    return { ok: false, message: `Unsupported roll expression: ${source}` };
  const evaluated = evaluateNode(parsed.expression, random);
  if ("ok" in evaluated) return evaluated;
  if (typeof evaluated.value === "string") {
    return {
      ok: true,
      kind: "text",
      value: evaluated.value,
      message: `${source}: ${evaluated.value}`,
    };
  }
  const details = evaluated.rolls.length
    ? `${evaluated.rolls.join("; ")} = `
    : "";
  return {
    ok: true,
    kind: "number",
    value: evaluated.value,
    message: `${source}: ${details}${evaluated.value}`,
  };
}

function validBoundary(character: string | undefined): boolean {
  return character === undefined || !/[A-Za-z0-9_{}[\]]/.test(character);
}

export interface RollExpressionMatch {
  start: number;
  end: number;
  source: string;
}

export function findRollExpressions(text: string): RollExpressionMatch[] {
  const matches: RollExpressionMatch[] = [];
  for (let start = 0; start < text.length; start += 1) {
    if (!validBoundary(text[start - 1])) continue;
    if (!/[0-9dDbBwW(+.-]/.test(text[start])) continue;
    let bestEnd = -1;
    const maximum = Math.min(text.length, start + 240);
    for (let end = start + 1; end <= maximum; end += 1) {
      if (!validBoundary(text[end])) continue;
      const candidate = text.slice(start, end).trimEnd();
      if (candidate && isRollExpression(candidate))
        bestEnd = start + candidate.length;
    }
    if (bestEnd > start) {
      matches.push({ start, end: bestEnd, source: text.slice(start, bestEnd) });
      start = bestEnd - 1;
    }
  }
  return matches;
}
