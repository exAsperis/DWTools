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
      ok: true;
      kind: "list";
      value: Array<number | string>;
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
  | {
      kind: "choice";
      count: number;
      values: Array<number | string>;
      mode: DiceMode;
    }
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
  value: number | string | Array<number | string>;
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
      this.parseSelectedRoll() ?? this.parseRoll("sum") ?? this.parseNumber()
    );
  }

  private parseSelectedRoll(): Expression | null {
    const start = this.index;
    const match = this.source
      .slice(this.index)
      .match(/^(highest|lowest|[bhlw])\[/i);
    if (!match) return null;
    const alias = match[1].toLowerCase();
    const mode: DiceMode =
      alias === "b" || alias === "h" || alias === "highest" ? "best" : "worst";
    this.index += match[0].length;
    const roll = this.parseRoll(mode);
    if (!roll || this.source[this.index] !== "]") {
      this.index = start;
      return null;
    }
    this.index += 1;
    return roll;
  }

  private parseRoll(mode: DiceMode): Expression | null {
    const start = this.index;
    const possibleCount = this.readInteger();
    if (this.source[this.index]?.toLowerCase() !== "d") {
      this.index = start;
      return null;
    }
    this.index += 1;
    if (this.source[this.index] === "{") {
      const values = this.parseChoiceValues();
      const count = possibleCount ?? 1;
      if (!values || !validCount(count)) {
        this.index = start;
        return null;
      }
      this.hasRoll = true;
      return { kind: "choice", count, values, mode };
    }
    const sides = this.readInteger();
    const count = possibleCount ?? 1;
    if (sides === null || !validDice(count, sides)) {
      this.index = start;
      return null;
    }
    this.hasRoll = true;
    return { kind: "dice", count, sides, mode };
  }

  private parseChoiceValues(): Array<number | string> | null {
    const close = this.source.indexOf("}", this.index + 1);
    if (close === -1) return null;
    const parts = this.source
      .slice(this.index + 1, close)
      .split(",")
      .map((part) => part.trim());
    if (!parts.length || parts.some((part) => part === "")) return null;
    const values = parts.map((part) => {
      const numeric = Number(part);
      return isFiniteDecimal(part) && Number.isFinite(numeric) ? numeric : part;
    });
    this.index = close + 1;
    return values;
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
    validCount(count) && Number.isInteger(sides) && sides >= 2 && sides <= 1000
  );
}

function validCount(count: number): boolean {
  return Number.isInteger(count) && count >= 1 && count <= 100;
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
    const selections = Array.from({ length: expression.count }, () => {
      const index = Math.min(
        Math.floor(random() * expression.values.length),
        expression.values.length - 1,
      );
      return { index, value: expression.values[index]! };
    });
    const allChoicesNumeric = expression.values.every(
      (value) => typeof value === "number",
    );
    let value: number | string | Array<number | string>;
    if (expression.mode === "best" || expression.mode === "worst") {
      const compare = allChoicesNumeric
        ? (selection: (typeof selections)[number]) => selection.value as number
        : (selection: (typeof selections)[number]) => selection.index;
      value = selections.reduce((selected, candidate) =>
        expression.mode === "best"
          ? compare(candidate) > compare(selected)
            ? candidate
            : selected
          : compare(candidate) < compare(selected)
            ? candidate
            : selected,
      ).value;
    } else if (
      selections.every((selection) => typeof selection.value === "number")
    ) {
      value = selections.reduce(
        (sum, selection) => sum + (selection.value as number),
        0,
      );
    } else if (expression.count === 1) {
      value = selections[0]!.value;
    } else {
      value = selections.map((selection) => selection.value);
    }
    const mode = expression.mode === "sum" ? "" : ` ${expression.mode}`;
    const outcomes = selections.map((selection) => String(selection.value));
    const retained =
      expression.mode === "sum" ? "" : `; retained ${String(value)}`;
    return {
      value,
      rolls: [
        `${expression.count}d{…}${mode} [${outcomes.join(", ")}]${retained}`,
      ],
    };
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
  if (Array.isArray(evaluated.value)) {
    const details = evaluated.rolls.length
      ? `${evaluated.rolls.join("; ")} = `
      : "";
    return {
      ok: true,
      kind: "list",
      value: evaluated.value,
      message: `${source}: ${details}[${evaluated.value.join(", ")}]`,
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
    if (!/[0-9dDbBwWhHlL(+.-]/.test(text[start])) continue;
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
