import bcrypt from 'bcryptjs';

/**
 * Hashes a plain text password using bcryptjs.
 * @param password - The plain text password to hash.
 * @returns The hashed password.
 */
export const hashPassword = async (password:string) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

/**
 * Compares a plain text password with a hashed password.
 * @param password - The plain text password.
 * @param hashedPassword - The hashed password.
 * @returns A boolean indicating if the passwords match.
 */
export const comparePassword = async (password:string, hashedPassword:string) => {
  return await bcrypt.compare(password, hashedPassword);
};
