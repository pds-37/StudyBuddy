import test from "node:test";
import assert from "node:assert/strict";
import { __companyPrepTestUtils } from "./company-prep.service.js";
import type { CompanyTypeProfile, PrepQuestion } from "@studybuddy/shared";

const profile: CompanyTypeProfile = {
  id: "product-giant",
  name: "Product Giants",
  summary: "Selective product hiring.",
  hiringFrequency: "medium",
  selectivity: "elite",
  difficulty: "hard",
  roleTags: ["Software Engineer", "Backend"],
  focusAreas: ["Arrays", "Graphs", "System Design"],
  exampleCompanies: ["Example"],
  procedure: [],
  questionMix: [
    { topic: "Arrays", weight: 30 },
    { topic: "Graphs", weight: 30 },
    { topic: "System Design", weight: 40 }
  ],
  lastUpdated: "2026-05"
};

const questions: PrepQuestion[] = [
  {
    id: "q-a",
    title: "Graph BFS",
    difficulty: "medium",
    topics: ["Graphs"],
    roleTags: ["Software Engineer"],
    companyTypes: [{ companyTypeId: "product-giant", frequency: 90, lastSeen: "2026-05", stage: "Coding" }],
    approach: { pattern: "Graph BFS", signal: "", steps: [], commonMistake: "", timeComplexity: "", spaceComplexity: "" },
    sourceRefs: []
  },
  {
    id: "q-b",
    title: "Design URL Shortener",
    difficulty: "medium",
    topics: ["System Design"],
    roleTags: ["Backend"],
    companyTypes: [{ companyTypeId: "product-giant", frequency: 88, lastSeen: "2026-05", stage: "System Design" }],
    approach: { pattern: "System Design", signal: "", steps: [], commonMistake: "", timeComplexity: "", spaceComplexity: "" },
    sourceRefs: [],
    userStatus: "solved"
  }
];

test("seed data has valid company type and question references", () => {
  assert.equal(__companyPrepTestUtils.validateSeedData(), true);
});

test("company type match rewards existing skills and concept retention", () => {
  const weak = __companyPrepTestUtils.computeCompanyTypeMatch({
    profile,
    questions,
    userSkills: ["HTML"],
    conceptScores: {},
    role: "Software Engineer"
  });

  const strong = __companyPrepTestUtils.computeCompanyTypeMatch({
    profile,
    questions,
    userSkills: ["Data Structures", "Backend"],
    conceptScores: { "system design": 82, graphs: 75 },
    role: "Backend"
  });

  assert.ok(strong.matchScore > weak.matchScore);
  assert.ok(strong.strongAreas.includes("System Design"));
});

test("prep plan prioritizes weak high-frequency questions and excludes solved next items", () => {
  const plan = __companyPrepTestUtils.buildCompanyPrepPlan({
    companyTypeId: "product-giant",
    role: "Software Engineer",
    matchScore: 70,
    weakAreas: ["Graphs"],
    strongAreas: ["System Design"],
    questions
  });

  assert.equal(plan.questionIds[0], "q-a");
  assert.ok(plan.nextQuestionIds.includes("q-a"));
  assert.ok(!plan.nextQuestionIds.includes("q-b"));
});
