import { createError } from 'apollo-errors';

export const GenericError = (message: string, data?: any) => {
  const Err = createError('Generic Error', { message, data });
  return new Err();
};

export const AuthError = (message: string, data?: any) => {
  const Err = createError('Authentication Error', { message, data });
  return new Err();
};

export const FileAuthenticationError = (message: string, data?: any) => {
  const Err = createError('File Validation Error', { message, data });
  return new Err();
};
