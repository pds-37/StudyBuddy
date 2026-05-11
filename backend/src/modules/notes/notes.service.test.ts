import test from "node:test";
import assert from "node:assert/strict";
import { __notesTestUtils } from "./notes.service.js";

test("learning ingestion title removes common capture prefixes", () => {
  assert.equal(
    __notesTestUtils.titleFromLearningText("Today I learned closures and lexical scope."),
    "closures and lexical scope"
  );
});

test("local analysis extracts useful concepts for offline/cloud fallback", () => {
  const analysis = __notesTestUtils.localAnalyzeLearning(
    "useEffect dependencies and closures",
    "Learned useEffect dependencies and closures in React."
  );

  assert.equal(analysis.topic, "React");
  assert.equal(analysis.difficulty, "intermediate");
  assert.ok(analysis.concepts.includes("useEffect"));
  assert.ok(analysis.concepts.includes("Closures"));
  assert.ok(analysis.flashcards.length >= 2);
});

test("local contradiction hints catch common conflicting terms", () => {
  assert.deepEqual(
    __notesTestUtils.detectContradictionPhrases("Closures copy variables, but also reference variables."),
    ["Potential contradiction or distinction to clarify: copy vs reference."]
  );
});
