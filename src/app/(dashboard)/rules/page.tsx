"use client";

import { useEffect, useState } from "react";
import { Rule } from "@/types/rule";
import { RuleCard } from "./rule-card";
import { CreateRuleForm } from "./create-rule-form";
import { Button } from "@/components/ui/button";

export function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetch("/api/rules")
      .then((res) => res.json())
      .then((data) => setRules(data.rules ?? []))
      .catch(() => setError("Failed to load rules"))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleToggle(id: string, enabled: boolean) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled } : r)),
    );
    const res = await fetch(`/api/rules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) {
      // revert on failure
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: !enabled } : r)),
      );
    }
  }

  async function handleDelete(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
    const res = await fetch(`/api/rules/${id}`, { method: "DELETE" });
    if (!res.ok) {
      // re-fetch to restore state if delete failed
      fetch("/api/rules")
        .then((r) => r.json())
        .then((data) => setRules(data.rules ?? []));
    }
  }

  function handleCreated(rule: Rule) {
    setRules((prev) => [rule, ...prev]);
    setIsCreating(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rules</h1>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>New rule</Button>
        )}
      </div>

      {isCreating && (
        <CreateRuleForm
          onCreated={handleCreated}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!isLoading && !error && rules.length === 0 && !isCreating && (
        <p className="text-sm text-muted-foreground">
          No rules yet. Create one to get started.
        </p>
      )}

      <div className="space-y-4">
        {rules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onUpdated={(updated) => setRules((prev) => prev.map((r) => r.id === updated.id ? updated : r))}
          />
        ))}
      </div>
    </div>
  );
}

export { RulesPage as default };
