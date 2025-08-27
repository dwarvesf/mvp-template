import { VALIDATION_RULES } from '../constants';

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  return (
    VALIDATION_RULES.EMAIL.REGEX.test(email) && email.length <= VALIDATION_RULES.EMAIL.MAX_LENGTH
  );
};

/**
 * Validates password strength
 */
export const isValidPassword = (password: string): boolean => {
  return (
    password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH &&
    password.length <= VALIDATION_RULES.PASSWORD.MAX_LENGTH
  );
};

/**
 * Validates password strength with regex
 */
export const isStrongPassword = (password: string): boolean => {
  return isValidPassword(password) && VALIDATION_RULES.PASSWORD.REGEX.test(password);
};

/**
 * Validates name format
 */
export const isValidName = (name: string): boolean => {
  return (
    name.length >= VALIDATION_RULES.NAME.MIN_LENGTH &&
    name.length <= VALIDATION_RULES.NAME.MAX_LENGTH &&
    name.trim().length > 0
  );
};

/**
 * Sanitizes string input by removing extra whitespace
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Validates pagination parameters
 */
export const validatePagination = (page: number, limit: number) => {
  const validPage = Math.max(1, Math.floor(page));
  const validLimit = Math.min(Math.max(1, Math.floor(limit)), 100);

  return { page: validPage, limit: validLimit };
};
