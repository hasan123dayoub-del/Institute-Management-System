// P2
// Business rules live here. Throw AppError(status, message, code); never touch req/res.
//
// - create: user + student in ONE transaction; reject if class is full (capacity)
// - move(id, classId): same level only, target open/running, not full; grades follow, one transaction
// - placeInClass(id, classId): for waiting students
// - remove: 409 if the student has grades, else delete user + student
// - list with filters (status, level, shift)
// - getMe(user): student portal data

export {};
