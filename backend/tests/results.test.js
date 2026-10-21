import assert from "node:assert/strict";
import test from "node:test";
import { calculateStudentResult } from "../services/resultService.js";

const ids = {
  studentId: "student-id",
  classId: "class-id",
  levelId: "level-id",
  levelCode: "A1",
};

test("calculates and retains the three individual exam scores and total", () => {
  const result = calculateStudentResult({
    ...ids,
    grades: [
      { exam: "oral", score: 16 },
      { exam: "midterm", score: 23 },
      { exam: "final", score: 34 },
    ],
  });

  assert.deepEqual(result.exam_scores, { oral: 16, midterm: 23, final: 34 });
  assert.equal(result.total_score, 73);
  assert.equal(result.max_score, 100);
  assert.equal(result.passed, true);
  assert.deepEqual(result.missing_exams, []);
});

test("treats missing exam scores as zero and identifies the missing exams", () => {
  const result = calculateStudentResult({
    ...ids,
    grades: [{ exam: "oral", score: 18 }],
  });

  assert.deepEqual(result.exam_scores, { oral: 18, midterm: null, final: null });
  assert.equal(result.total_score, 18);
  assert.equal(result.passed, false);
  assert.deepEqual(result.missing_exams, ["midterm", "final"]);
});

test("uses the latest score for a corrected exam and passes at 60", () => {
  const result = calculateStudentResult({
    ...ids,
    grades: [
      { exam: "oral", score: 10, graded_at: new Date("2026-01-01") },
      { exam: "oral", score: 20, graded_at: new Date("2026-01-02") },
      { exam: "midterm", score: 20 },
      { exam: "final", score: 20 },
    ],
  });

  assert.equal(result.exam_scores.oral, 20);
  assert.equal(result.total_score, 60);
  assert.equal(result.passed, true);
});
