// P3
// Business rules live here. Throw AppError(status, message, code); never touch req/res.
//
// - upsert grades for a class the teacher owns (oral /20, midterm /30, final /50)
// - final opens on the last session day; locked once the class is finished
// - total(studentId, classId): sum out of 100; pass >= 60

export {};
