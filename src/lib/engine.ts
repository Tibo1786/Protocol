/**
 * Pure rule evaluation engine — no DB calls, no side effects.
 * All functions must remain side-effect-free so they can be unit-tested
 * without any infrastructure.
 *
 * Rule YAML shape:
 *   name: string
 *   conditions:
 *     - field: "user.age"      # dot-notation path into the payload
 *       operator: gt | lt | gte | lte | eq | neq | in | not_in | contains
 *       value: <any>
 *   action: string             # returned verbatim when all conditions match
 *   match: all | any           # default: all
 */

import yaml from "js-yaml";

export type Operator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "not_in"
  | "contains";

export type Condition = {
  field: string;
  operator: Operator;
  value: unknown;
};

export type ParsedRule = {
  name: string;
  action: string;
  match: "all" | "any";
  conditions: Condition[];
};

export type EvaluationResult = {
  matched: boolean;
  action: string | null;
  conditions: Condition[];
  rule_id: string;
};

/** Resolve a dot-notation path against a plain object. */
export function resolvePath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

/** Evaluate a single condition against a payload. */
export function evaluateCondition(
  payload: unknown,
  condition: Condition
): boolean {
  const actual = resolvePath(payload, condition.field);
  const { operator, value } = condition;

  switch (operator) {
    case "eq":
      return actual === value;
    case "neq":
      return actual !== value;
    case "gt":
      return typeof actual === "number" && typeof value === "number" && actual > value;
    case "gte":
      return typeof actual === "number" && typeof value === "number" && actual >= value;
    case "lt":
      return typeof actual === "number" && typeof value === "number" && actual < value;
    case "lte":
      return typeof actual === "number" && typeof value === "number" && actual <= value;
    case "in":
      return Array.isArray(value) && value.includes(actual);
    case "not_in":
      return Array.isArray(value) && !value.includes(actual);
    case "contains":
      return typeof actual === "string" && typeof value === "string" && actual.includes(value);
    default:
      return false;
  }
}

/** Parse a YAML string into a validated rule definition. */
export function parseRule(yamlSource: string): ParsedRule {
  const raw = yaml.load(yamlSource) as Record<string, unknown>;

  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid rule: must be a YAML object");
  }
  if (typeof raw.name !== "string") throw new Error("Rule must have a string `name`");
  if (typeof raw.action !== "string") throw new Error("Rule must have a string `action`");
  if (!Array.isArray(raw.conditions)) throw new Error("Rule must have a `conditions` array");

  const match = raw.match === "any" ? "any" : "all";

  const conditions: Condition[] = (raw.conditions as unknown[]).map((c, i) => {
    const cond = c as Record<string, unknown>;
    if (typeof cond.field !== "string") throw new Error(`Condition ${i}: field must be a string`);
    if (typeof cond.operator !== "string") throw new Error(`Condition ${i}: operator must be a string`);
    if (!("value" in cond)) throw new Error(`Condition ${i}: value is required`);
    return { field: cond.field, operator: cond.operator as Operator, value: cond.value };
  });

  return { name: raw.name, action: raw.action, match, conditions };
}

/** Evaluate a parsed rule against a JSON payload. */
export function evaluateRule(
  rule: ParsedRule,
  ruleId: string,
  payload: unknown
): EvaluationResult {
  const results = rule.conditions.map((c) => ({
    condition: c,
    passed: evaluateCondition(payload, c),
  }));

  const matched =
    rule.match === "any"
      ? results.some((r) => r.passed)
      : results.every((r) => r.passed);

  const matchedConditions = results.filter((r) => r.passed).map((r) => r.condition);

  return {
    matched,
    action: matched ? rule.action : null,
    conditions: matchedConditions,
    rule_id: ruleId,
  };
}
