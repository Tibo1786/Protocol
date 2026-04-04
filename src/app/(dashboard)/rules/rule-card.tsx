"use client";

import { useState } from "react";
import { Rule } from "@/types/rule";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RuleCardProps {
  rule: Rule;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onUpdated: (rule: Rule) => void;
}

export function RuleCard({ rule, onToggle, onDelete, onUpdated }: RuleCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(rule.name);
  const [description, setDescription] = useState(rule.description ?? "");
  const [yaml, setYaml] = useState(rule.yaml);
  const [priority, setPriority] = useState(rule.priority);
  const [error, setError] = useState<string | null>(null);
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function handleDelete() {
    if (window.confirm(`Delete rule "${rule.name}"?`)) {
      onDelete(rule.id);
    }
  }

  async function handleSave() {
    setError(null);
    setYamlError(null);
    setIsPending(true);

    const res = await fetch(`/api/rules/${rule.id}`, {
      method: "PATCH",
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
      setError(data.error ?? "Failed to update rule");
      setIsPending(false);
      return;
    }

    onUpdated(data.rule as Rule);
    setIsEditing(false);
    setIsPending(false);
  }

  function handleCancel() {
    setName(rule.name);
    setDescription(rule.description ?? "");
    setYaml(rule.yaml);
    setPriority(rule.priority);
    setError(null);
    setYamlError(null);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`name-${rule.id}`}>Name</Label>
              <Input id={`name-${rule.id}`} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`priority-${rule.id}`}>Priority</Label>
              <Input id={`priority-${rule.id}`} type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`desc-${rule.id}`}>Description</Label>
            <Input id={`desc-${rule.id}`} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`yaml-${rule.id}`}>Rule YAML</Label>
            <Textarea
              id={`yaml-${rule.id}`}
              value={yaml}
              onChange={(e) => setYaml(e.target.value)}
              className="font-mono text-sm"
              rows={8}
            />
            {yamlError && <p className="text-sm text-destructive">{yamlError}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">{rule.name}</CardTitle>
            {rule.description && (
              <CardDescription>{rule.description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">p{rule.priority}</Badge>
            <Switch
              checked={rule.enabled}
              onCheckedChange={(checked) => onToggle(rule.id, checked)}
              aria-label={rule.enabled ? "Disable rule" : "Enable rule"}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">
          {rule.yaml}
        </pre>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
