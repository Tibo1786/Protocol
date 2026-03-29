# Evaluate API

## POST /api/evaluate

Evaluates a JSON payload against the organisation's enabled rules.

### Request

```json
{
  "payload": {
    "user.age": 25,
    "transaction.amount": 5000,
    "transaction.currency": "USD"
  },
  "rule_ids": ["optional-specific-rule-id"]
}
```

- `payload` (required): JSON object to evaluate against rules. Supports dot-notation field paths.
- `rule_ids` (optional): Array of specific rule IDs to evaluate. If omitted, all enabled rules are evaluated.

### Response

```json
{
  "results": [
    {
      "matched": true,
      "rule_id": "clx1abc...",
      "action": "flag_for_review",
      "conditions": [
        { "field": "transaction.amount", "operator": "gt", "value": 1000 }
      ]
    }
  ]
}
```

Each result contains:
- `matched` — whether the payload satisfied the rule's conditions
- `rule_id` — the rule that was evaluated
- `action` — the action string if matched, `null` otherwise
- `conditions` — the full list of conditions from the rule

### Rule YAML format

```yaml
match: all          # "all" (AND) or "any" (OR)
conditions:
  - field: transaction.amount
    operator: gt
    value: 1000
  - field: user.country
    operator: in
    value: [US, CA, GB]
action: flag_for_review
```

### Operators

| Operator   | Description                          |
|------------|--------------------------------------|
| `eq`       | Equal                                |
| `neq`      | Not equal                            |
| `gt`       | Greater than (numbers only)          |
| `gte`      | Greater than or equal (numbers only) |
| `lt`       | Less than (numbers only)             |
| `lte`      | Less than or equal (numbers only)    |
| `in`       | Value is in array                    |
| `not_in`   | Value is not in array                |
| `contains` | String contains substring            |
| `exists`   | Field exists (value: true/false)     |

### Authentication

Requires a valid session. Organisation is derived from the session's active organisation — never supply `organisation_id` in the request body.

### Errors

- `401` — No valid session
- `400` — No active organisation or invalid request body
