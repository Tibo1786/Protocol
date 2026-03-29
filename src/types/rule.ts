export interface Rule {
  id: string;
  organisationId: string;
  name: string;
  description: string | null;
  yaml: string;
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}
