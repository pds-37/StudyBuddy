import test from "node:test";
import assert from "node:assert/strict";
import { __recallTestUtils } from "./recall.service.js";

test("recall grading maps semantic scores to good, weak, and wrong", () => {
  assert.equal(__recallTestUtils.gradeFromScore(0.8), "good");
  assert.equal(__recallTestUtils.gradeFromScore(0.3), "weak");
  assert.equal(__recallTestUtils.gradeFromScore(0.1), "wrong");
});

test("requested recall grade overrides automatic score", () => {
  assert.equal(__recallTestUtils.gradeFromScore(0.8, "weak"), "weak");
});

test("recall strength moves in the expected direction", () => {
  assert.ok(__recallTestUtils.applyStrength(0.4, "good") > 0.4);
  assert.ok(__recallTestUtils.applyStrength(0.4, "weak") > 0.4);
  assert.ok(__recallTestUtils.applyStrength(0.4, "wrong") < 0.4);
});

test("wrong recall is scheduled sooner than good recall", () => {
  const wrong = __recallTestUtils.scheduleNext(0.5, "wrong").getTime();
  const good = __recallTestUtils.scheduleNext(0.5, "good").getTime();

  assert.ok(wrong < good);
});
