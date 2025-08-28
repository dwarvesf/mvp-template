import {
  isValidEmail,
  isStrongPassword,
  isValidName,
  LoginSchema,
  CreateUserSchema,
  VALIDATION_RULES,
} from '@mvp-template/shared';
import { ZodError } from 'zod';

export const validateLoginForm = (email: string, password: string) => {
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    errors.password = `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSignupForm = (email: string, password: string, name?: string) => {
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!isStrongPassword(password)) {
    errors.password = VALIDATION_RULES.PASSWORD.MESSAGE;
  }

  if (name && !isValidName(name)) {
    errors.name = `Name must be between ${VALIDATION_RULES.NAME.MIN_LENGTH} and ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Use Zod schemas for form validation
export const validateWithSchema = {
  login: (data: unknown) => {
    try {
      const result = LoginSchema.parse(data);
      return { success: true, data: result, errors: {} };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          data: null,
          errors: error.issues.reduce((acc: Record<string, string>, err) => {
            if (err.path[0]) {
              acc[err.path[0] as string] = err.message;
            }
            return acc;
          }, {}),
        };
      }
      return {
        success: false,
        data: null,
        errors: { general: 'Validation failed' },
      };
    }
  },

  signup: (data: unknown) => {
    try {
      const result = CreateUserSchema.parse(data);
      return { success: true, data: result, errors: {} };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          data: null,
          errors: error.issues.reduce((acc: Record<string, string>, err) => {
            if (err.path[0]) {
              acc[err.path[0] as string] = err.message;
            }
            return acc;
          }, {}),
        };
      }
      return {
        success: false,
        data: null,
        errors: { general: 'Validation failed' },
      };
    }
  },
};
