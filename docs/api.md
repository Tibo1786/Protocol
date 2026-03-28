# Evaluate API Contract

`POST /api/evaluate`

Requires a valid session cookie (BetterAuth). The organisation is resolved from the session — never supply `organisation_id` from the client.

## Request

```json
{
  "rule_id": "clx123abc",
  "payload": {
    "user": { "age": 25, "country": "GB" },
    "transaction": { "amount": 1500 }
  }
}
```

## Response — matched

```json
{
  "matched": true,
  "action": "flag_for_review",
  "conditions": [
    { "field": "transaction.amount", "operator": "gt", "value": 1000 }
  ],
  "rule_id": "clx123abc"
}
```

## Response — no match

```json
{
  "matched": false,
  "action": null,
  "conditions": [],
  "rule_id": "clx123abc"
}
```

## Errors

| Status | Meaning |
|--------|---------|
| 400 | Missing or invalid request body |
| 401 | Not authenticated |
| 404 | Rule not found or not ACTIVE in this org |
| 422 | Rule YAML is invalid |

## Rule YAML format

```yaml
name: High-value transaction check
action: flag_for_review
match: all          # all (default) | any
conditions:
  - field: transaction.amount
    operator: gt
    value: 1000
  - field: user.country
    operator: in
    value: [GB, US, DE]
```

### Supported operators

| Operator | Description |
|----------|-------------|
| `eq` | Equal |
| `neq` | Not equal |
| `gt` | Greater than (numeric) |
| `gte` | Greater than or equal (numeric) |
| `lt` | Less than (numeric) |
| `lte` | Less than or equal (numeric) |
| `in` | Value is in array |
| `not_in` | Value is not in array |
| `contains` | String contains substring |
