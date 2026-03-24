import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkItem extends Document {
  tenant_id: bigint;
  provider: string;
  project_key: string;
  issue_key: string;
  jira_issue_id: string;
  title: string;
  description: string;
  assignee: string;
  status_category: string;
  priority: string;
  due_date: string;
  intent_frozen_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const WorkItemSchema = new Schema<IWorkItem>(
  {
    tenant_id:        { type: BigInt, required: true, index: true },
    provider:         { type: String, required: true, default: 'jira' },
    project_key:      { type: String, required: true },
    issue_key:        { type: String, required: true },
    jira_issue_id:    { type: String, default: '' },
    title:            { type: String, default: '' },
    description:      { type: String, default: '' },
    assignee:         { type: String, default: '' },
    status_category:  { type: String, default: '' },
    priority:         { type: String, default: '' },
    due_date:         { type: String, default: '' },
    intent_frozen_at: { type: Date,   default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

WorkItemSchema.index(
  { tenant_id: 1, provider: 1, project_key: 1, issue_key: 1 },
  { unique: true }
);

export const WorkItem = mongoose.model<IWorkItem>('WorkItem', WorkItemSchema);
