import * as yaml from "js-yaml";

export interface RuleCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains" | "exists";
  value: unknown;
}

export interface RuleDefinition {
  conditions: RuleCondition[];
  action: string;
  match: "all" | "any";
}

export interface EvaluationResult {
  matched: boolean;
  rule_id: string;
  action: string | null;
  conditions: RuleCondition[];
}

export function parseRule(yamlString: string): RuleDefinition {
  const parsed = yaml.load(yamlString) as RuleDefinition;

  if (!parsed || !Array.isArray(parsed.conditions)) {
    throw new Error("Invalid rule: must contain a conditions array");
  }
  if (!parsed.action) {
    throw new Error("Invalid rule: must contain an action");
  }

  parsed.match = parsed.match ?? "all";
  return parsed;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

function evaluateCondition(
  condition: RuleCondition,
  payload: Record<string, unknown>,
): boolean {
  const fieldValue = getNestedValue(payload, condition.field);

  switch (condition.operator) {
    case "eq":
      return fieldValue === condition.value;
    case "neq":
      return fieldValue !== condition.value;
    case "gt":
      return typeof fieldValue === "number" && fieldValue > (condition.value as number);
    case "gte":
      return typeof fieldValue === "number" && fieldValue >= (condition.value as number);
    case "lt":
      return typeof fieldValue === "number" && fieldValue < (condition.value as number);
    case "lte":
      return typeof fieldValue === "number" && fieldValue <= (condition.value as number);
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(fieldValue);
    case "not_in":
      return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
    case "contains":
      return typeof fieldValue === "string" && fieldValue.includes(condition.value as string);
    case "exists":
      return condition.value ? fieldValue !== undefined : fieldValue === undefined;
    default:
      return false;
  }
}

export function evaluateRule(
  rule: RuleDefinition,
  payload: Record<string, unknown>,
): boolean {
  const results = rule.conditions.map((c) => evaluateCondition(c, payload));

  if (rule.match === "any") {
    return results.some(Boolean);
  }

  return results.every(Boolean);
}

export function evaluateRules(
  rules: Array<{ id: string; yaml: string; priority: number }>,
  payload: Record<string, unknown>,
): EvaluationResult[] {
  const sorted = [...rules].sort((a, b) => b.priority - a.priority);

  return sorted.map((rule) => {
    const definition = parseRule(rule.yaml);
    const matched = evaluateRule(definition, payload);

    return {
      matched,
      rule_id: rule.id,
      action: matched ? definition.action : null,
      conditions: definition.conditions,
    };
  });
}
