import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const hiringStageSchema = new Schema(
  {
    order: { type: Number, required: true },
    name: { type: String, required: true },
    format: { type: String, required: true },
    duration: { type: String, required: true },
    evaluationSignals: { type: [String], default: [] },
    preparationTips: { type: [String], default: [] },
    eliminationRisk: { type: String, enum: ["low", "medium", "high"], required: true }
  },
  { _id: false }
);

const companyTypeSchema = new Schema(
  {
    typeId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    summary: { type: String, required: true },
    hiringFrequency: { type: String, enum: ["very-high", "high", "medium", "low"], required: true },
    selectivity: { type: String, enum: ["mass", "balanced", "selective", "elite"], required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    roleTags: { type: [String], default: [] },
    focusAreas: { type: [String], default: [] },
    exampleCompanies: { type: [String], default: [] },
    procedure: { type: [hiringStageSchema], default: [] },
    questionMix: {
      type: [
        new Schema(
          {
            topic: { type: String, required: true },
            weight: { type: Number, min: 0, max: 100, required: true }
          },
          { _id: false }
        )
      ],
      default: []
    },
    lastUpdated: { type: String, required: true }
  },
  { timestamps: true }
);

const approachSchema = new Schema(
  {
    pattern: { type: String, required: true },
    signal: { type: String, required: true },
    steps: { type: [String], default: [] },
    commonMistake: { type: String, required: true },
    timeComplexity: { type: String, required: true },
    spaceComplexity: { type: String, required: true }
  },
  { _id: false }
);

const questionCompanyTagSchema = new Schema(
  {
    companyTypeId: { type: String, required: true, index: true },
    frequency: { type: Number, min: 0, max: 100, required: true },
    lastSeen: { type: String, required: true },
    stage: { type: String, required: true }
  },
  { _id: false }
);

const prepQuestionSchema = new Schema(
  {
    questionId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true, index: true },
    topics: { type: [String], default: [], index: true },
    roleTags: { type: [String], default: [], index: true },
    companyTypes: { type: [questionCompanyTagSchema], default: [] },
    approach: { type: approachSchema, required: true },
    sourceRefs: {
      type: [
        new Schema(
          {
            label: { type: String, required: true },
            url: { type: String }
          },
          { _id: false }
        )
      ],
      default: []
    }
  },
  { timestamps: true }
);

prepQuestionSchema.index({ "companyTypes.companyTypeId": 1, difficulty: 1 });

const userPrepProgressSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    questionId: { type: String, required: true, index: true },
    status: { type: String, enum: ["attempted", "solved", "bookmarked"], required: true },
    savedNoteId: { type: String, default: null },
    lastPracticedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

userPrepProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true });
userPrepProgressSchema.index({ userId: 1, status: 1 });

const companyPrepTargetSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    companyTypeId: { type: String, required: true, index: true },
    role: { type: String, required: true },
    matchScore: { type: Number, min: 0, max: 100, required: true },
    weakAreas: { type: [String], default: [] },
    strongAreas: { type: [String], default: [] },
    prepQuestionIds: { type: [String], default: [] },
    completedQuestionIds: { type: [String], default: [] },
    targetDate: { type: Date, default: null },
    status: { type: String, enum: ["active", "paused", "completed"], default: "active" }
  },
  { timestamps: true }
);

companyPrepTargetSchema.index({ userId: 1, companyTypeId: 1, role: 1 }, { unique: true });
companyPrepTargetSchema.index({ userId: 1, status: 1 });

export type CompanyTypeDocument = HydratedDocument<InferSchemaType<typeof companyTypeSchema>>;
export type PrepQuestionDocument = HydratedDocument<InferSchemaType<typeof prepQuestionSchema>>;
export type UserPrepProgressDocument = HydratedDocument<InferSchemaType<typeof userPrepProgressSchema>>;
export type CompanyPrepTargetDocument = HydratedDocument<InferSchemaType<typeof companyPrepTargetSchema>>;

export const CompanyTypeModel = model("CompanyType", companyTypeSchema);
export const PrepQuestionModel = model("PrepQuestion", prepQuestionSchema);
export const UserPrepProgressModel = model("UserPrepProgress", userPrepProgressSchema);
export const CompanyPrepTargetModel = model("CompanyPrepTarget", companyPrepTargetSchema);
