import { ErrorConfig, createError } from 'apollo-errors';

export const GenericError = (message: string, data?: ErrorConfig) => {
  const Err = createError('Generic Error', { message, data });
  return new Err();
};

export const AuthError = (message: string, data?: ErrorConfig) => {
  const Err = createError('Authentication Error', { message, data });
  return new Err();
};

export const FileAuthenticationError = (message: string, data?: ErrorConfig) => {
  const Err = createError('File Validation Error', { message, data });
  return new Err();
};
