import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkItemMapping extends Document {
  tenant_id: bigint;
  provider: string;
  project_key: string;
  project_name: string;
  issue_types: Array<{ id: string; name: string }>;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  status_mapping: {
    "To Do": string[];
    "In Progress": string[];
    "Done": string[];
    "Blocked": string[];
  };
  created_at: Date;
  updated_at: Date;
}

const WorkItemMappingSchema = new Schema<IWorkItemMapping>(
  {
    tenant_id: { type: BigInt, required: true, index: true },
    provider: { type: String, required: true, default: 'jira' },
    project_key: { type: String, required: true },
    project_name: { type: String, default: '' },
    issue_types: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
      },
    ],
    title:       { type: String, default: 'summary' },
    description: { type: String, default: 'description' },
    status:      { type: String, default: 'status' },
    priority:    { type: String, default: 'priority' },
    due_date:    { type: String, default: 'duedate' },
    status_mapping: {
      type: {
        "To Do":       { type: [String], default: [] },
        "In Progress": { type: [String], default: [] },
        "Done":        { type: [String], default: [] },
        "Blocked":     { type: [String], default: [] },
      },
      default: () => ({ "To Do": [], "In Progress": [], "Done": [], "Blocked": [] }),
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// One mapping per tenant + provider + project combination
WorkItemMappingSchema.index(
  { tenant_id: 1, provider: 1, project_key: 1 },
  { unique: true }
);

export const WorkItemMapping = mongoose.model<IWorkItemMapping>(
  'WorkItemMapping',
  WorkItemMappingSchema
);
