"use client";

import { useState } from "react";
import { Rule } from "@/types/rule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateRuleFormProps {
  onCreated: (rule: Rule) => void;
  onCancel: () => void;
}

const YAML_PLACEHOLDER = `match: all
conditions:
  - field: transaction.amount
    operator: gt
    value: 1000
action: flag_for_review`;

export function CreateRuleForm({ onCreated, onCancel }: CreateRuleFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [yaml, setYaml] = useState("");
  const [priority, setPriority] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setYamlError(null);
    setIsPending(true);

    const res = await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || undefined, yaml, priority }),
    });

    const data = await res.json();

    if (res.status === 422) {
      setYamlError(data.details ?? "Invalid rule YAML");
      setIsPending(false);
      return;
    }

    if (!res.ok) {
      setError(data.error ?? "Failed to create rule");
      setIsPending(false);
      return;
    }

    onCreated(data.rule as Rule);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <h3 className="font-medium">New rule</h3>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rule-name">Name</Label>
          <Input
            id="rule-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rule-priority">Priority</Label>
          <Input
            id="rule-priority"
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rule-description">Description</Label>
        <Input
          id="rule-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rule-yaml">Rule YAML</Label>
        <Textarea
          id="rule-yaml"
          value={yaml}
          onChange={(e) => setYaml(e.target.value)}
          placeholder={YAML_PLACEHOLDER}
          className="font-mono text-sm"
          rows={8}
          required
        />
        {yamlError && (
          <p className="text-sm text-destructive">{yamlError}</p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create rule"}
        </Button>
      </div>
    </form>
  );
}
