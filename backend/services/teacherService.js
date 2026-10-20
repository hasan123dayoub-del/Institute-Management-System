// P1
// Business rules live here. Throw AppError(status, message, code); never touch req/res.
//
// - create: user + teacher in ONE transaction (hash password, salary, hire_date)
// - pay(id): 409 if salary_status is already paid
// - update, list (with their classes)

export {};
