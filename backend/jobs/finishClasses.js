import cron from "node-cron";

export const GRACE_DAYS = 3;

// TODO (P3): for every running class, compute lastSessionDate (lib/sessions.js);
// if today >= last + GRACE_DAYS, in ONE transaction: for each student sum the
// grades (out of 100), pass if >= 60 -> next level, class_id = null,
// status "waiting" ("graduated" after C2); fail -> same level, "waiting";
// then set the class status to "finished".
export async function finishClasses() {}

export const start = () => cron.schedule("0 1 * * *", finishClasses); // every day 01:00
