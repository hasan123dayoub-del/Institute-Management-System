// P1
// Business rules live here. Throw AppError(status, message, code); never touch req/res.
//
// - list / create / update / remove secretaries (admin only)
// - remove: reject if she is the last active secretary (409)
// - create: hash password, role = secretary

export {};
