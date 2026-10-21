import bcrypt from "bcrypt";

export const MIN_LENGTH = 8;
export const hash = (plain) => bcrypt.hash(plain, 10);
export const compare = (plain, hashed) => bcrypt.compare(plain, hashed);

export const CAN_SET = { admin: ["secretary"], secretary: ["teacher", "student"] };
