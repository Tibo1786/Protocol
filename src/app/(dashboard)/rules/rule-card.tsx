"use client";

import { Rule } from "@/types/rule";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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
}

export function RuleCard({ rule, onToggle, onDelete }: RuleCardProps) {
  function handleDelete() {
    if (window.confirm(`Delete rule "${rule.name}"?`)) {
      onDelete(rule.id);
    }
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
        <div className="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
