import { Schema, model, type InferSchemaType } from "mongoose";

const skillTaxonomySchema = new Schema(
  {
    source: {
      type: String,
      enum: ["onet", "esco", "custom"],
      default: "onet",
      index: true
    },
    sourceSkillId: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    aliases: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      default: "General"
    },
    description: {
      type: String,
      default: ""
    },
    parentSkillId: {
      type: String,
      default: ""
    },
    relatedRoles: {
      type: [String],
      default: []
    },
    embeddingStatus: {
      type: String,
      enum: ["pending", "ready", "failed"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

export type SkillTaxonomyDocument = InferSchemaType<typeof skillTaxonomySchema> & {
  _id: unknown;
};

export const SkillTaxonomyModel = model("SkillTaxonomy", skillTaxonomySchema);
