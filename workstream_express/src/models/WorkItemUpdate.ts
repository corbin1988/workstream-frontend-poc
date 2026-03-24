import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkItemUpdateAnswer {
  question_id: string;
  question_text: string;
  answer: string;
  scope: 'project' | 'tenant';
}

export interface IWorkItemUpdate extends Document {
  tenant_id: bigint;
  issue_key: string;
  project_key: string;
  review_date: Date;
  answers: IWorkItemUpdateAnswer[];
  is_complete: boolean;
  created_at: Date;
  updated_at: Date;
}

const WorkItemUpdateSchema = new Schema<IWorkItemUpdate>(
  {
    tenant_id:   { type: BigInt, required: true, index: true },
    issue_key:   { type: String, required: true },
    project_key: { type: String, required: true },
    review_date: { type: Date,   required: true },
    answers: [
      {
        question_id:   { type: String, required: true },
        question_text: { type: String, required: true },
        answer:        { type: String, default: '' },
        scope:         { type: String, enum: ['project', 'tenant'], required: true },
      },
    ],
    is_complete: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

WorkItemUpdateSchema.index(
  { tenant_id: 1, issue_key: 1, review_date: 1 },
  { unique: true }
);

export const WorkItemUpdate = mongoose.model<IWorkItemUpdate>('WorkItemUpdate', WorkItemUpdateSchema);
