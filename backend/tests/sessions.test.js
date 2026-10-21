import assert from "node:assert/strict";
import test from "node:test";
import { lastSessionDate, totalSessions } from "../lib/sessions.js";

test("computes the final session from level hours and recurring schedule days", () => {
  const lastDate = lastSessionDate(
    { start_date: "2026-01-03T00:00:00.000Z", level: { hours: 3 } },
    [{ day: "sat" }],
  );

  assert.equal(lastDate.toISOString(), "2026-01-10T00:00:00.000Z");
});

test("starts counting on the first scheduled day on or after the class start", () => {
  const lastDate = lastSessionDate(
    { start_date: "2026-01-04T00:00:00.000Z", level: { hours: 3 } },
    [{ day: "sat" }],
  );

  assert.equal(lastDate.toISOString(), "2026-01-17T00:00:00.000Z");
});

test("returns no end date when the schedule or level data is invalid", () => {
  assert.equal(lastSessionDate({ start_date: "2026-01-03" }, [{ day: "sat" }]), null);
  assert.equal(
    lastSessionDate({ start_date: "invalid", level: { hours: 3 } }, [{ day: "sat" }]),
    null,
  );
  assert.equal(lastSessionDate({ start_date: "2026-01-03", level: { hours: 3 } }, []), null);
});

test("converts level hours to a count of 90-minute sessions", () => {
  assert.equal(totalSessions({ hours: 36 }), 24);
  assert.equal(totalSessions({ hours: 0 }), 0);
});
