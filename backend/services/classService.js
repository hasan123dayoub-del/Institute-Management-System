// P2
// Business rules live here. Throw AppError(status, message, code); never touch req/res.
//
// - create (UNIQUE level+shift+start_date), update, list by status, get with students
// - start(id): open -> running
// - remove: only if open and empty (409 otherwise)
// - finishClass(cls): used by jobs/finishClasses (P3 wires it)

export {};
