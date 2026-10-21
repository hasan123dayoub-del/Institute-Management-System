import assert from "node:assert/strict";
import test from "node:test";
import {
  DAILY_RUN_HOUR_UTC,
  GRACE_DAYS,
  isClassDue,
  millisecondsUntilNextDailyRun,
} from "../jobs/finishClasses.js";

test("class finishing occurs after the last session and three full grace days", () => {
  const lastSession = new Date("2026-01-10T00:00:00.000Z");
  assert.equal(GRACE_DAYS, 3);
  assert.equal(isClassDue(lastSession, new Date("2026-01-13T23:59:59.999Z")), false);
  assert.equal(isClassDue(lastSession, new Date("2026-01-14T00:00:00.000Z")), true);
});

test("class finishing compares calendar dates instead of instants", () => {
  const lastSession = new Date("2026-01-10T00:00:00.000Z");
  assert.equal(isClassDue(lastSession, new Date("2026-01-13T01:00:00.000Z")), false);
});

test("daily scheduler calculates delay to the next 01:00 UTC run", () => {
  assert.equal(DAILY_RUN_HOUR_UTC, 1);
  assert.equal(
    millisecondsUntilNextDailyRun(new Date("2026-01-10T00:00:00.000Z")),
    60 * 60 * 1000,
  );
  assert.equal(
    millisecondsUntilNextDailyRun(new Date("2026-01-10T01:00:00.000Z")),
    24 * 60 * 60 * 1000,
  );
  assert.equal(
    millisecondsUntilNextDailyRun(new Date("2026-01-10T02:00:00.000Z")),
    23 * 60 * 60 * 1000,
  );
});
