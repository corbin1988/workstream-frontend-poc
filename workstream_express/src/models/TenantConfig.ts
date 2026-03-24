import mongoose, { Schema, Document } from 'mongoose';

export interface ITenantConfig extends Document {
  tenant_id: bigint;
  task_questions: Array<{ id: string; text: string }>;
  created_at: Date;
  updated_at: Date;
}

const TenantConfigSchema = new Schema<ITenantConfig>(
  {
    tenant_id: { type: BigInt, required: true, unique: true, index: true },
    task_questions: {
      type: [
        {
          id:   { type: String, required: true },
          text: { type: String, required: true },
        },
      ],
      default: () => [],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export const TenantConfig = mongoose.model<ITenantConfig>('TenantConfig', TenantConfigSchema);
