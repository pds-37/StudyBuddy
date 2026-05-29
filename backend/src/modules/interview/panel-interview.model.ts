import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

export interface CommitteeSpeaker {
  speaker: "Devin (Lead Architect)" | "Sarah (Product Manager)" | "Marcus (Engineering Manager)";
  dialogue: string;
  mood: "skeptical" | "satisfied" | "impatient" | "impressed" | "critical" | "neutral" | "supportive";
}

export interface PanelQuestion {
  id: string;
  question: string;
  category: "technical" | "system_design" | "behavioral" | "scenario";
  userAnswer?: string;
  debateTranscript?: CommitteeSpeaker[];
  idealAnswer: string;
}

const committeeSpeakerSchema = new Schema({
  speaker: { type: String, enum: ["Devin (Lead Architect)", "Sarah (Product Manager)", "Marcus (Engineering Manager)"], required: true },
  dialogue: { type: String, required: true },
  mood: { type: String, enum: ["skeptical", "satisfied", "impatient", "impressed", "critical", "neutral", "supportive"], required: true }
}, { _id: false });

const panelQuestionSchema = new Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  category: { type: String, enum: ["technical", "system_design", "behavioral", "scenario"], required: true },
  userAnswer: { type: String },
  debateTranscript: { type: [committeeSpeakerSchema], default: [] },
  idealAnswer: { type: String, required: true }
}, { _id: false });

const panelMetricsSchema = new Schema({
  satisfaction: { type: Number, required: true, default: 50 },
  impatience: { type: Number, required: true, default: 10 }
}, { _id: false });

const panelSessionSchema = new Schema({
  userId: { type: String, required: true, index: true },
  targetRole: { type: String, required: true },
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
  questions: { type: [panelQuestionSchema], required: true },
  currentQuestionIndex: { type: Number, required: true, default: 0 },
  overallScore: { type: Number },
  overallFeedback: { type: String },
  stressIndex: { type: Number, required: true, default: 20 },
  interruptionRisk: { type: Number, required: true, default: 10 },
  metrics: {
    architect: { type: panelMetricsSchema, required: true, default: () => ({ satisfaction: 50, impatience: 10 }) },
    pm: { type: panelMetricsSchema, required: true, default: () => ({ satisfaction: 50, impatience: 10 }) },
    em: { type: panelMetricsSchema, required: true, default: () => ({ satisfaction: 60, impatience: 5 }) }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export type PanelInterviewDocument = HydratedDocument<InferSchemaType<typeof panelSessionSchema>>;
export const PanelInterviewModel = model("PanelInterview", panelSessionSchema);
