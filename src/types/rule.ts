export interface Rule {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  yaml: string;
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}
